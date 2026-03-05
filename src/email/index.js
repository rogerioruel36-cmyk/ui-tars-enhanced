/**
 * Email Processing Module
 * Unified interface for email operations: IMAP/SMTP integration,
 * automatic classification, and auto-reply generation
 */

const ImapClient = require('./ImapClient');
const SmtpClient = require('./SmtpClient');
const EmailClassifier = require('./EmailClassifier');
const AutoReply = require('./AutoReply');

class EmailProcessor {
  constructor(config = {}) {
    this.config = config;
    this.imap = new ImapClient(config.imap);
    this.smtp = new SmtpClient(config.smtp);
    this.classifier = new EmailClassifier();
    this.autoReply = new AutoReply();
    this.connected = false;
  }

  /**
   * Initialize connections to email servers
   * @param {object} config - Optional configuration overrides
   */
  async initialize(config = {}) {
    const imapConfig = config.imap || this.config.imap;
    const smtpConfig = config.smtp || this.config.smtp;

    // Connect to IMAP
    if (imapConfig) {
      await this.imap.connect(imapConfig);
      await this.imap.openBox(imapConfig.box || 'INBOX');
    }

    // Connect to SMTP
    if (smtpConfig) {
      await this.smtp.connect(smtpConfig);
    }

    this.connected = true;
  }

  /**
   * Fetch and process emails
   * @param {object} options - Fetch options
   * @returns {Promise<object[]>} Processed emails
   */
  async fetchEmails(options = {}) {
    const emails = await this.imap.getEmails(options);

    // Classify emails
    const classifiedEmails = this.classifier.classifyBatch(emails);

    return classifiedEmails;
  }

  /**
   * Process emails with auto-classification and optional auto-reply
   * @param {object} options - Processing options
   * @returns {Promise<object>} Processing results
   */
  async processEmails(options = {}) {
    const {
      autoReply = false,
      markAsRead = true,
      moveToFolders = false,
      ...fetchOptions
    } = options;

    // Fetch emails
    const emails = await this.fetchEmails(fetchOptions);

    const results = {
      processed: emails.length,
      byCategory: {},
      autoRepliesSent: 0,
      errors: []
    };

    // Process each email
    for (const email of emails) {
      const category = email.classification?.category || 'inbox';

      // Count by category
      results.byCategory[category] = (results.byCategory[category] || 0) + 1;

      // Send auto-reply if enabled
      if (autoReply && this.autoReply.shouldAutoReply(email)) {
        try {
          const reply = this.autoReply.generateContextualReply(
            email,
            email.classification
          );

          if (reply) {
            await this.smtp.sendEmail(reply);
            results.autoRepliesSent++;
          }
        } catch (err) {
          results.errors.push({
            email: email.uid,
            error: err.message
          });
        }
      }

      // Mark as read
      if (markAsRead && email.uid) {
        try {
          await this.imap.markAsRead([email.uid]);
        } catch (err) {
          // Ignore errors for marking read
        }
      }

      // Move to folder if classification suggests it
      if (moveToFolders && category !== 'inbox' && category !== 'spam') {
        try {
          await this.imap.moveEmails([email.uid], category);
        } catch (err) {
          // Ignore errors for moving
        }
      }
    }

    return results;
  }

  /**
   * Send an email
   * @param {object} options - Email options
   * @returns {Promise<object>} Send result
   */
  async sendEmail(options) {
    return this.smtp.sendEmail(options);
  }

  /**
   * Send HTML email
   * @param {string} to - Recipient
   * @param {string} subject - Subject
   * @param {string} html - HTML content
   * @returns {Promise<object>} Send result
   */
  async sendHtmlEmail(to, subject, html) {
    return this.smtp.sendHtmlEmail(to, subject, html);
  }

  /**
   * Send email with attachments
   * @param {string} to - Recipient
   * @param {string} subject - Subject
   * @param {string} body - Body text
   * @param {string[]} attachments - Array of file paths
   * @returns {Promise<object>} Send result
   */
  async sendWithAttachments(to, subject, body, attachments) {
    return this.smtp.sendWithAttachments(to, subject, body, attachments);
  }

  /**
   * Forward an email
   * @param {object} email - Original email
   * @param {string} to - Forward recipient
   * @param {string} additionalText - Additional text
   * @returns {Promise<object>} Send result
   */
  async forwardEmail(email, to, additionalText) {
    return this.smtp.forwardEmail(email, to, additionalText);
  }

  /**
   * Reply to an email
   * @param {object} email - Original email
   * @param {string} replyText - Reply text
   * @param {boolean} replyAll - Reply to all
   * @returns {Promise<object>} Send result
   */
  async replyToEmail(email, replyText, replyAll = false) {
    return this.smtp.replyToEmail(email, replyText, replyAll);
  }

  /**
   * Get classifier instance for customization
   */
  getClassifier() {
    return this.classifier;
  }

  /**
   * Get auto-reply instance for customization
   */
  getAutoReply() {
    return this.autoReply;
  }

  /**
   * Disconnect from email servers
   */
  async disconnect() {
    await this.imap.disconnect();
    this.smtp.disconnect();
    this.connected = false;
  }
}

// Factory function for quick setup
async function createEmailProcessor(imapConfig, smtpConfig) {
  const processor = new EmailProcessor({ imap: imapConfig, smtp: smtpConfig });
  await processor.initialize();
  return processor;
}

module.exports = {
  EmailProcessor,
  ImapClient,
  SmtpClient,
  EmailClassifier,
  AutoReply,
  createEmailProcessor
};

// Also export default for convenience
module.exports.default = EmailProcessor;
