/**
 * Email Classifier
 * Automatic email classification based on rules and keywords
 */

class EmailClassifier {
  constructor() {
    // Default categories
    this.categories = {
      important: {
        name: 'Important',
        keywords: ['urgent', 'important', 'asap', 'critical', 'emergency'],
        priority: 1
      },
      work: {
        name: 'Work',
        keywords: ['meeting', 'project', 'deadline', 'report', 'task', 'team', 'company'],
        priority: 2
      },
      personal: {
        name: 'Personal',
        keywords: ['friend', 'family', 'birthday', 'party', 'invitation'],
        priority: 3
      },
      promotions: {
        name: 'Promotions',
        keywords: ['sale', 'discount', 'offer', 'deal', 'subscribe', 'newsletter', 'promo'],
        priority: 4
      },
      social: {
        name: 'Social',
        keywords: ['facebook', 'twitter', 'linkedin', 'instagram', 'social', 'notification'],
        priority: 5
      },
      spam: {
        name: 'Spam',
        keywords: ['winner', 'lottery', 'prize', 'click here', 'verify', 'suspicious'],
        priority: 6
      },
      inbox: {
        name: 'Inbox',
        keywords: [],
        priority: 0
      }
    };

    // Custom rules
    this.customRules = [];

    // Sender rules (whitelist/blacklist)
    this.senderRules = {
      whitelist: [],
      blacklist: []
    };
  }

  /**
   * Add a custom classification rule
   * @param {string} category - Category name
   * @param {string[]} keywords - Keywords to match
   * @param {number} priority - Priority (lower = higher priority)
   */
  addRule(category, keywords, priority = 10) {
    this.customRules.push({
      category,
      keywords: keywords.map(k => k.toLowerCase()),
      priority
    });
  }

  /**
   * Add sender to whitelist
   * @param {string} sender - Sender email or domain
   */
  addToWhitelist(sender) {
    this.senderRules.whitelist.push(sender.toLowerCase());
  }

  /**
   * Add sender to blacklist
   * @param {string} sender - Sender email or domain
   */
  addToBlacklist(sender) {
    this.senderRules.blacklist.push(sender.toLowerCase());
  }

  /**
   * Extract email address from sender
   * @param {object} from - From address (can be string or object)
   * @returns {string} Email address
   */
  extractEmail(from) {
    if (!from) return '';
    if (typeof from === 'string') return from.toLowerCase();

    // Handle mailparser address object
    if (from.value && from.value.length > 0) {
      return from.value[0].address?.toLowerCase() || '';
    }
    return '';
  }

  /**
   * Classify a single email
   * @param {object} email - Email object
   * @returns {object} Classification result
   */
  classify(email) {
    const result = {
      category: 'inbox',
      confidence: 0,
      reasons: []
    };

    const emailText = `${email.subject || ''} ${email.text || ''}`.toLowerCase();
    const senderEmail = this.extractEmail(email.from);

    // Check blacklist first
    for (const blocked of this.senderRules.blacklist) {
      if (senderEmail.includes(blocked)) {
        return {
          category: 'spam',
          confidence: 100,
          reasons: ['sender in blacklist']
        };
      }
    }

    // Check whitelist - mark as important
    for (const allowed of this.senderRules.whitelist) {
      if (senderEmail.includes(allowed)) {
        result.category = 'important';
        result.confidence = 90;
        result.reasons.push('sender in whitelist');
        return result;
      }
    }

    // Check custom rules first (highest priority)
    const sortedCustomRules = [...this.customRules].sort((a, b) => a.priority - b.priority);

    for (const rule of sortedCustomRules) {
      for (const keyword of rule.keywords) {
        if (emailText.includes(keyword)) {
          result.category = rule.category;
          result.confidence = 80;
          result.reasons.push(`matches custom rule: ${keyword}`);
          return result;
        }
      }
    }

    // Check built-in categories by priority
    const sortedCategories = Object.entries(this.categories)
      .filter(([key]) => key !== 'inbox')
      .sort((a, b) => a[1].priority - b[1].priority);

    for (const [key, category] of sortedCategories) {
      for (const keyword of category.keywords) {
        if (emailText.includes(keyword)) {
          result.category = key;
          result.confidence = 70;
          result.reasons.push(`keyword: ${keyword}`);
          return result;
        }
      }
    }

    return result;
  }

  /**
   * Classify multiple emails
   * @param {object[]} emails - Array of email objects
   * @returns {object[]} Emails with classification results
   */
  classifyBatch(emails) {
    return emails.map(email => ({
      ...email,
      classification: this.classify(email)
    }));
  }

  /**
   * Filter emails by category
   * @param {object[]} emails - Array of classified emails
   * @param {string} category - Category to filter by
   * @returns {object[]} Filtered emails
   */
  filterByCategory(emails, category) {
    return emails.filter(email =>
      email.classification?.category === category
    );
  }

  /**
   * Get emails that need attention (important + work)
   * @param {object[]} emails - Array of classified emails
   * @returns {object[]} Priority emails
   */
  getPriorityEmails(emails) {
    return emails.filter(email => {
      const cat = email.classification?.category;
      return cat === 'important' || cat === 'work';
    });
  }

  /**
   * Create suggested folder mappings based on classification
   * @param {object[]} emails - Array of classified emails
   * @returns {object} Folder mapping suggestions
   */
  suggestFolderMappings(emails) {
    const mappings = {};

    for (const email of emails) {
      const category = email.classification?.category || 'inbox';
      if (!mappings[category]) {
        mappings[category] = [];
      }
      mappings[category].push(email.uid);
    }

    return mappings;
  }
}

module.exports = EmailClassifier;
