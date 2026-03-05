/**
 * IMAP Client for receiving emails
 * Handles connection to IMAP servers and email retrieval
 */

const Imap = require('imap');
const { simpleParser } = require('mailparser');

class ImapClient {
  constructor(config) {
    this.config = config || {};
    this.imap = null;
    this.connected = false;
  }

  /**
   * Connect to IMAP server
   * @param {object} config - IMAP configuration
   */
  connect(config = {}) {
    return new Promise((resolve, reject) => {
      const imapConfig = {
        user: config.user || this.config.user,
        password: config.password || this.config.password,
        host: config.host || this.config.host || 'imap.gmail.com',
        port: config.port || this.config.port || 993,
        tls: config.tls !== undefined ? config.tls : true,
        tlsOptions: { rejectUnauthorized: false }
      };

      this.imap = new Imap(imapConfig);

      this.imap.once('ready', () => {
        this.connected = true;
        resolve();
      });

      this.imap.once('error', (err) => {
        this.connected = false;
        reject(err);
      });

      this.imap.connect();
    });
  }

  /**
   * Open a specific mailbox
   * @param {string} boxName - Mailbox name (default: INBOX)
   */
  openBox(boxName = 'INBOX') {
    return new Promise((resolve, reject) => {
      if (!this.connected) {
        return reject(new Error('Not connected to IMAP server'));
      }
      this.imap.openBox(boxName, true, (err, box) => {
        if (err) reject(err);
        else resolve(box);
      });
    });
  }

  /**
   * Search and retrieve emails
   * @param {object} options - Search options
   * @param {number} options.limit - Maximum number of emails to retrieve
   * @param {boolean} options.unread - Only fetch unread emails
   * @param {string} options.since - Fetch emails since this date
   * @param {string} options.from - Filter by sender
   * @param {string} options.subject - Filter by subject
   */
  async getEmails(options = {}) {
    const {
      limit = 10,
      unread = false,
      since = null,
      from = null,
      subject = null
    } = options;

    if (!this.connected) {
      throw new Error('Not connected to IMAP server');
    }

    // Build search criteria
    const criteria = [];
    if (unread) criteria.push('UNSEEN');
    if (since) criteria.push(['SINCE', since]);
    if (from) criteria.push(['FROM', from]);
    if (subject) criteria.push(['SUBJECT', subject]);

    if (criteria.length === 0) {
      criteria.push('ALL');
    }

    return new Promise((resolve, reject) => {
      this.imap.search(criteria, async (err, results) => {
        if (err) return reject(err);

        if (results.length === 0) {
          return resolve([]);
        }

        // Limit results
        const limitedResults = results.slice(-limit);

        const emails = [];
        const fetch = this.imap.fetch(limitedResults, {
          bodies: '',
          struct: true
        });

        fetch.on('message', (msg) => {
          const email = {
            headers: {},
            body: '',
            attachments: []
          };

          msg.on('body', async (stream) => {
            try {
              const parsed = await simpleParser(stream);
              email.from = parsed.from;
              email.to = parsed.to;
              email.cc = parsed.cc;
              email.subject = parsed.subject;
              email.date = parsed.date;
              email.text = parsed.text;
              email.html = parsed.html;
              email.attachments = parsed.attachments.map(att => ({
                filename: att.filename,
                contentType: att.contentType,
                size: att.size
              }));
            } catch (e) {
              // Handle parsing errors
            }
          });

          msg.once('attributes', (attrs) => {
            email.uid = attrs.uid;
            email.flags = attrs.flags;
            email.modseq = attrs.modseq;
          });

          msg.once('end', () => {
            emails.push(email);
          });
        });

        fetch.once('error', reject);
        fetch.once('end', () => {
          resolve(emails);
        });
      });
    });
  }

  /**
   * Mark emails as read
   * @param {number[]} uids - Email UIDs to mark
   */
  markAsRead(uids) {
    return new Promise((resolve, reject) => {
      if (!this.connected) {
        return reject(new Error('Not connected to IMAP server'));
      }

      this.imap.setFlags(uids, ['\\Seen'], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  /**
   * Move emails to a folder
   * @param {number[]} uids - Email UIDs to move
   * @param {string} boxName - Target mailbox
   */
  moveEmails(uids, boxName) {
    return new Promise((resolve, reject) => {
      if (!this.connected) {
        return reject(new Error('Not connected to IMAP server'));
      }

      this.imap.move(uids, boxName, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  /**
   * Get list of mailboxes
   */
  getBoxes() {
    return new Promise((resolve, reject) => {
      if (!this.connected) {
        return reject(new Error('Not connected to IMAP server'));
      }

      this.imap.getBoxes((err, boxes) => {
        if (err) reject(err);
        else resolve(boxes);
      });
    });
  }

  /**
   * Disconnect from IMAP server
   */
  disconnect() {
    return new Promise((resolve) => {
      if (this.imap) {
        this.imap.once('end', () => {
          this.connected = false;
          resolve();
        });
        this.imap.end();
      } else {
        this.connected = false;
        resolve();
      }
    });
  }
}

module.exports = ImapClient;
