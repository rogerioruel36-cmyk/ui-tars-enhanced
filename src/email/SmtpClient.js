/**
 * SMTP Client for sending emails
 * Handles connection to SMTP servers and email sending
 */

const nodemailer = require('nodemailer');

class SmtpClient {
  constructor(config) {
    this.config = config || {};
    this.transporter = null;
    this.connected = false;
  }

  /**
   * Create SMTP transporter
   * @param {object} config - SMTP configuration
   */
  connect(config = {}) {
    return new Promise((resolve, reject) => {
      const smtpConfig = {
        host: config.host || this.config.host || 'smtp.gmail.com',
        port: config.port || this.config.port || 465,
        secure: config.secure !== undefined ? config.secure : true,
        auth: {
          user: config.user || this.config.user,
          pass: config.password || this.config.password || this.config.pass
        },
        tls: config.tls || { rejectUnauthorized: false }
      };

      // Handle OAuth2 authentication
      if (config.oauth2) {
        smtpConfig.auth = {
          type: 'OAuth2',
          user: config.user,
          clientId: config.oauth2.clientId,
          clientSecret: config.oauth2.clientSecret,
          refreshToken: config.oauth2.refreshToken,
          accessToken: config.oauth2.accessToken
        };
      }

      this.transporter = nodemailer.createTransport(smtpConfig);

      // Verify connection
      this.transporter.verify((err, success) => {
        if (err) {
          this.connected = false;
          reject(err);
        } else {
          this.connected = true;
          resolve(success);
        }
      });
    });
  }

  /**
   * Send an email
   * @param {object} options - Email options
   * @param {string|string[]} options.to - Recipients
   * @param {string|string[]} options.cc - CC recipients
   * @param {string|string[]} options.bcc - BCC recipients
   * @param {string} options.subject - Email subject
   * @param {string} options.text - Plain text body
   * @param {string} options.html - HTML body
   * @param {string} options.from - Sender (optional, uses configured address)
   * @param {object[]} options.attachments - Attachments
   */
  async sendEmail(options) {
    if (!this.connected && this.transporter) {
      throw new Error('Not connected to SMTP server');
    }

    const mailOptions = {
      from: options.from || this.config.from || this.config.user,
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      cc: options.cc ? (Array.isArray(options.cc) ? options.cc.join(', ') : options.cc) : undefined,
      bcc: options.bcc ? (Array.isArray(options.bcc) ? options.bcc.join(', ') : options.bcc) : undefined,
      subject: options.subject,
      text: options.text,
      html: options.html,
      attachments: options.attachments
    };

    // Filter out undefined values
    Object.keys(mailOptions).forEach(key => {
      if (mailOptions[key] === undefined) {
        delete mailOptions[key];
      }
    });

    return new Promise((resolve, reject) => {
      this.transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          reject(err);
        } else {
          resolve({
            messageId: info.messageId,
            accepted: info.accepted,
            rejected: info.rejected,
            pending: info.pending,
            response: info.response
          });
        }
      });
    });
  }

  /**
   * Send email with file attachments
   * @param {string} to - Recipient
   * @param {string} subject - Subject
   * @param {string} body - Email body
   * @param {string[]} attachments - Array of file paths
   */
  async sendWithAttachments(to, subject, body, attachments) {
    const attachmentObjects = attachments.map(file => ({
      path: file
    }));

    return this.sendEmail({
      to,
      subject,
      text: body,
      attachments: attachmentObjects
    });
  }

  /**
   * Send HTML email
   * @param {string} to - Recipient
   * @param {string} subject - Subject
   * @param {string} html - HTML body
   */
  async sendHtmlEmail(to, subject, html) {
    return this.sendEmail({
      to,
      subject,
      html
    });
  }

  /**
   * Forward an email
   * @param {object} originalEmail - Original email to forward
   * @param {string} to - Forward recipient
   * @param {string} additionalText - Additional text to add
   */
  async forwardEmail(originalEmail, to, additionalText = '') {
    const forwardedBody = `${additionalText}\n\n---------- Forwarded message ----------\nFrom: ${originalEmail.from}\nDate: ${originalEmail.date}\nSubject: ${originalEmail.subject}\n\n${originalEmail.text}`;

    return this.sendEmail({
      to,
      subject: `Fwd: ${originalEmail.subject}`,
      text: forwardedBody
    });
  }

  /**
   * Reply to an email
   * @param {object} originalEmail - Original email to reply to
   * @param {string} replyText - Reply body
   * @param {boolean} replyAll - Reply to all recipients
   */
  async replyToEmail(originalEmail, replyText, replyAll = false) {
    // Extract reply-to address
    let replyTo = originalEmail.from;
    if (originalEmail.replyTo) {
      replyTo = originalEmail.replyTo;
    }

    const recipients = replyAll ? [replyTo, ...(originalEmail.cc || [])] : replyTo;

    return this.sendEmail({
      to: recipients,
      subject: `Re: ${originalEmail.subject}`,
      text: replyText
    });
  }

  /**
   * Disconnect from SMTP server
   */
  disconnect() {
    if (this.transporter) {
      this.transporter.close();
      this.connected = false;
    }
  }
}

module.exports = SmtpClient;
