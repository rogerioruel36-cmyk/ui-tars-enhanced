/**
 * Error Tracker
 * Tracks and manages errors with categorization and analysis
 */
const fs = require('fs');
const path = require('path');

class ErrorTracker {
  constructor(options = {}) {
    this.maxErrors = options.maxErrors || 1000;
    this.errors = [];
    this.errorCounts = new Map();
    this.errorPatterns = new Map();
    this.categories = options.categories || {
      'browser': /browser|page|puppeteer|playwright/i,
      'network': /fetch|request|network|http|timeout/i,
      'workflow': /workflow|stage|action|execution/i,
      'skill': /skill|handler/i,
      'file': /file|fs|read|write|path/i,
      'validation': /validation|schema|parse|json/i
    };
  }

  /**
   * Track an error
   */
  track(error, context = {}) {
    const errorEntry = {
      id: this._generateId(),
      timestamp: new Date().toISOString(),
      message: error.message || String(error),
      stack: error.stack || '',
      category: this._categorize(error),
      context: {
        ...context,
        // Add common context
        workflowId: context.workflowId || null,
        stageId: context.stageId || null,
        actionId: context.actionId || null
      },
      count: 1
    };

    // Check for duplicate (similar error in last minute)
    const duplicate = this._findDuplicate(errorEntry);
    if (duplicate) {
      duplicate.count++;
      duplicate.lastSeen = errorEntry.timestamp;
      this.errorCounts.set(duplicate.id, (this.errorCounts.get(duplicate.id) || 0) + 1);
      return duplicate;
    }

    // Add new error
    this.errors.unshift(errorEntry);

    // Track error type
    const errorKey = this._getErrorKey(errorEntry);
    const pattern = this.errorPatterns.get(errorKey) || { ...errorEntry, count: 1 };
    pattern.count++;
    pattern.lastSeen = errorEntry.timestamp;
    this.errorPatterns.set(errorKey, pattern);

    // Track count
    this.errorCounts.set(errorEntry.id, 1);

    // Trim if needed
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors);
    }

    return errorEntry;
  }

  _generateId() {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  _categorize(error) {
    const message = error.message || String(error);
    for (const [category, pattern] of Object.entries(this.categories)) {
      if (pattern.test(message)) {
        return category;
      }
    }
    return 'unknown';
  }

  _getErrorKey(errorEntry) {
    // Create a key based on message and stack
    const msg = errorEntry.message.substring(0, 100);
    const stack = errorEntry.stack?.split('\n')[0] || '';
    return `${msg}|${stack}`;
  }

  _findDuplicate(errorEntry) {
    const oneMinuteAgo = Date.now() - 60000;
    return this.errors.find(e =>
      e.message === errorEntry.message &&
      new Date(e.timestamp).getTime() > oneMinuteAgo
    );
  }

  /**
   * Get all tracked errors
   */
  getErrors(filter = {}) {
    let result = [...this.errors];

    if (filter.category) {
      result = result.filter(e => e.category === filter.category);
    }

    if (filter.from) {
      result = result.filter(e => new Date(e.timestamp) >= new Date(filter.from));
    }

    if (filter.to) {
      result = result.filter(e => new Date(e.timestamp) <= new Date(filter.to));
    }

    if (filter.limit) {
      result = result.slice(0, filter.limit);
    }

    return result;
  }

  /**
   * Get error statistics
   */
  getStats() {
    const stats = {
      total: this.errors.length,
      byCategory: {},
      byPattern: {},
      recent: {
        last1min: 0,
        last5min: 0,
        last1hour: 0
      },
      topErrors: []
    };

    const now = Date.now();
    const last1min = now - 60000;
    const last5min = now - 300000;
    const last1hour = now - 3600000;

    for (const error of this.errors) {
      const ts = new Date(error.timestamp).getTime();

      // Count by category
      stats.byCategory[error.category] = (stats.byCategory[error.category] || 0) + 1;

      // Recent counts
      if (ts > last1min) stats.recent.last1min++;
      if (ts > last5min) stats.recent.last5min++;
      if (ts > last1hour) stats.recent.last1hour++;
    }

    // Top errors by pattern
    stats.topErrors = Array.from(this.errorPatterns.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map(e => ({
        message: e.message.substring(0, 100),
        count: e.count,
        category: e.category,
        lastSeen: e.lastSeen
      }));

    return stats;
  }

  /**
   * Get errors grouped by pattern
   */
  getPatterns() {
    return Array.from(this.errorPatterns.values())
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Clear old errors
   */
  clear(olderThan = null) {
    if (!olderThan) {
      this.errors = [];
      this.errorCounts.clear();
      this.errorPatterns.clear();
      return;
    }

    const cutoff = new Date(olderThan).getTime();
    this.errors = this.errors.filter(e => new Date(e.timestamp).getTime() > cutoff);

    // Rebuild patterns
    this.errorPatterns.clear();
    for (const error of this.errors) {
      const key = this._getErrorKey(error);
      const pattern = this.errorPatterns.get(key);
      if (pattern) {
        pattern.count++;
      } else {
        this.errorPatterns.set(key, { ...error, count: 1 });
      }
    }
  }

  /**
   * Save errors to file
   */
  saveToFile(filePath) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify({
      errors: this.errors,
      stats: this.getStats(),
      savedAt: new Date().toISOString()
    }, null, 2));
  }

  /**
   * Load errors from file
   */
  loadFromFile(filePath) {
    if (!fs.existsSync(filePath)) {
      return;
    }
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    this.errors = data.errors || [];
  }

  /**
   * Wrap a function to track errors
   */
  wrap(fn, context = {}) {
    return async (...args) => {
      try {
        return await fn(...args);
      } catch (error) {
        this.track(error, context);
        throw error;
      }
    };
  }
}

// Singleton instance
let globalTracker = null;

function createErrorTracker(options) {
  return new ErrorTracker(options);
}

function getGlobalErrorTracker() {
  if (!globalTracker) {
    globalTracker = new ErrorTracker();
  }
  return globalTracker;
}

module.exports = { ErrorTracker, createErrorTracker, getGlobalErrorTracker };
