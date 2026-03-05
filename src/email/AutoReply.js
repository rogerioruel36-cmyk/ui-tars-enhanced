/**
 * Auto-Reply Generator
 * Generates automatic replies based on email content and rules
 */

class AutoReply {
  constructor() {
    // Default templates
    this.templates = {
      acknowledgment: {
        subject: 'Re: {{subject}}',
        body: `Dear {{senderName}},

Thank you for your email. I have received your message and will get back to you as soon as possible.

Best regards`
      },
      outOfOffice: {
        subject: 'Out of Office: {{subject}}',
        body: `Dear {{senderName}},

Thank you for your email. I am currently out of the office with limited access to email.

I will respond to your message upon my return on {{returnDate}}.

Best regards`
      },
      vacation: {
        subject: 'Away: {{subject}}',
        body: `Hi {{senderName}},

I'm currently on vacation and won't have regular access to email.

I'll respond to your message when I return.

Thank you for your patience`
      },
      meetingRequest: {
        subject: 'Re: Meeting Request - {{subject}}',
        body: `Dear {{senderName}},

Thank you for your meeting request. I have received your invitation and will review my schedule.

I will get back to you shortly to confirm or suggest an alternative time.

Best regards`
      },
      inquiry: {
        subject: 'Re: {{subject}}',
        body: `Hello {{senderName}},

Thank you for your inquiry. I have received your message and am looking into your request.

I will provide you with a detailed response soon.

Best regards`
      },
      custom: {
        subject: 'Re: {{subject}}',
        body: `Dear {{senderName}},

{{customMessage}}

Best regards`
      }
    };

    // Auto-reply rules
    this.rules = [];
  }

  /**
   * Add custom template
   * @param {string} name - Template name
   * @param {string} subject - Subject template
   * @param {string} body - Body template
   */
  addTemplate(name, subject, body) {
    this.templates[name] = { subject, body };
  }

  /**
   * Add auto-reply rule
   * @param {object} rule - Rule configuration
   */
  addRule(rule) {
    this.rules.push({
      name: rule.name,
      conditions: rule.conditions || {},
      template: rule.template || 'acknowledgment',
      enabled: rule.enabled !== false
    });
  }

  /**
   * Extract sender name from email
   * @param {object} from - From address
   * @returns {string} Sender name
   */
  getSenderName(from) {
    if (!from) return 'User';

    if (typeof from === 'string') {
      return from.split('@')[0];
    }

    if (from.value && from.value.length > 0) {
      const name = from.value[0].name;
      if (name) return name.split(' ')[0];
      return from.value[0].address?.split('@')[0] || 'User';
    }

    return 'User';
  }

  /**
   * Replace template variables
   * @param {string} template - Template string
   * @param {object} data - Data to replace
   * @returns {string} Processed string
   */
  processTemplate(template, data) {
    let result = template;

    for (const [key, value] of Object.entries(data)) {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }

    return result;
  }

  /**
   * Generate auto-reply
   * @param {object} email - Original email
   * @param {object} options - Reply options
   * @returns {object} Generated reply
   */
  generateReply(email, options = {}) {
    const {
      template = 'acknowledgment',
      customMessage = null,
      returnDate = null
    } = options;

    const templateObj = this.templates[template] || this.templates.acknowledgment;
    const senderName = this.getSenderName(email.from);

    const replacements = {
      senderName,
      subject: email.subject || '',
      customMessage: customMessage || '',
      returnDate: returnDate || 'next week'
    };

    const reply = {
      to: email.from,
      subject: this.processTemplate(templateObj.subject, replacements),
      text: this.processTemplate(templateObj.body, replacements)
    };

    return reply;
  }

  /**
   * Generate contextual auto-reply based on email content
   * @param {object} email - Original email
   * @param {object} classification - Email classification
   * @returns {object} Generated reply
   */
  generateContextualReply(email, classification = {}) {
    const category = classification.category || 'inbox';
    const confidence = classification.confidence || 0;

    // Skip auto-reply for low confidence or spam
    if (category === 'spam' || confidence < 50) {
      return null;
    }

    // Choose template based on category
    let template = 'acknowledgment';

    switch (category) {
      case 'important':
        template = 'acknowledgment';
        break;
      case 'work':
        template = 'inquiry';
        break;
      case 'personal':
        template = 'acknowledgment';
        break;
      case 'promotions':
      case 'social':
        // Don't auto-reply to these categories
        return null;
      default:
        template = 'acknowledgment';
    }

    return this.generateReply(email, { template });
  }

  /**
   * Check if auto-reply should be sent based on rules
   * @param {object} email - Email to check
   * @returns {boolean} Whether to send auto-reply
   */
  shouldAutoReply(email) {
    // Check each enabled rule
    for (const rule of this.rules) {
      if (!rule.enabled) continue;

      let matches = true;

      // Check conditions
      if (rule.conditions.from) {
        const fromEmail = email.from?.value?.[0]?.address || '';
        if (!fromEmail.includes(rule.conditions.from)) {
          matches = false;
        }
      }

      if (rule.conditions.subjectContains) {
        if (!email.subject?.toLowerCase().includes(rule.conditions.subjectContains.toLowerCase())) {
          matches = false;
        }
      }

      if (rule.conditions.notFrom) {
        const fromEmail = email.from?.value?.[0]?.address || '';
        if (fromEmail.includes(rule.conditions.notFrom)) {
          matches = false;
        }
      }

      if (matches) {
        return true;
      }
    }

    // Default: send acknowledgment if no rules
    return this.rules.length === 0;
  }

  /**
   * Get available templates
   * @returns {string[]} Template names
   */
  getTemplates() {
    return Object.keys(this.templates);
  }
}

module.exports = AutoReply;
