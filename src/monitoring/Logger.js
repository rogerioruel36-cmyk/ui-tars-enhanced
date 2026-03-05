/**
 * Structured Logger
 * Supports multiple log levels, formatters, and output destinations
 */
const fs = require('fs');
const path = require('path');

class Logger {
  constructor(options = {}) {
    this.level = options.level || 'info';
    this.levels = { debug: 0, info: 1, warn: 2, error: 3 };
    this.handlers = [];
    this.context = options.context || {};
    this.enableTimestamp = options.enableTimestamp !== false;
    this.enableColors = options.enableColors !== false;

    // Default console handler
    this.addHandler({
      log: (level, message, meta) => {
        const timestamp = this.enableTimestamp ? new Date().toISOString() : '';
        const color = this.getColor(level);
        const prefix = this.context.name ? `[${this.context.name}] ` : '';
        const msg = `${timestamp ? timestamp + ' ' : ''}${color}${prefix}${message}${this.resetColor()}`;
        console.log(msg, meta || '');
      }
    });
  }

  getColor(level) {
    if (!this.enableColors) return '';
    const colors = {
      debug: '\x1b[36m',   // cyan
      info: '\x1b[32m',    // green
      warn: '\x1b[33m',    // yellow
      error: '\x1b[31m'    // red
    };
    return colors[level] || '';
  }

  resetColor() {
    return this.enableColors ? '\x1b[0m' : '';
  }

  addHandler(handler) {
    this.handlers.push(handler);
  }

  setLevel(level) {
    if (this.levels[level] !== undefined) {
      this.level = level;
    }
  }

  shouldLog(level) {
    return this.levels[level] >= this.levels[this.level];
  }

  _log(level, message, meta) {
    if (!this.shouldLog(level)) return;

    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: this.context,
      ...(meta && { meta })
    };

    for (const handler of this.handlers) {
      handler.log(level, message, meta, logEntry);
    }
  }

  debug(message, meta) {
    this._log('debug', message, meta);
  }

  info(message, meta) {
    this._log('info', message, meta);
  }

  warn(message, meta) {
    this._log('warn', message, meta);
  }

  error(message, meta) {
    this._log('error', message, meta);
  }

  // Create a child logger with additional context
  child(additionalContext) {
    return new Logger({
      level: this.level,
      context: { ...this.context, ...additionalContext },
      enableTimestamp: this.enableTimestamp,
      enableColors: this.enableColors
    });
  }
}

/**
 * File Handler - writes logs to file
 */
class FileHandler {
  constructor(filePath, options = {}) {
    this.filePath = filePath;
    this.maxSize = options.maxSize || 10 * 1024 * 1024; // 10MB
    this.maxFiles = options.maxFiles || 5;
    this.enableRotation = options.enableRotation !== false;

    // Ensure directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  log(level, message, meta, entry) {
    let line = JSON.stringify(entry) + '\n';

    // Check file size and rotate if needed
    if (this.enableRotation && fs.existsSync(this.filePath)) {
      const stats = fs.statSync(this.filePath);
      if (stats.size >= this.maxSize) {
        this._rotate();
      }
    }

    fs.appendFileSync(this.filePath, line);
  }

  _rotate() {
    // Remove oldest file
    const oldestFile = `${this.filePath}.${this.maxFiles}`;
    if (fs.existsSync(oldestFile)) {
      fs.unlinkSync(oldestFile);
    }

    // Shift files
    for (let i = this.maxFiles - 1; i >= 1; i--) {
      const current = `${this.filePath}.${i}`;
      const next = `${this.filePath}.${i + 1}`;
      if (fs.existsSync(current)) {
        fs.renameSync(current, next);
      }
    }

    // Rename current to .1
    if (fs.existsSync(this.filePath)) {
      fs.renameSync(this.filePath, `${this.filePath}.1`);
    }
  }
}

/**
 * Create logger instance
 */
function createLogger(options) {
  return new Logger(options);
}

/**
 * Create file logger
 */
function createFileLogger(filePath, options) {
  const logger = new Logger(options);
  logger.addHandler(new FileHandler(filePath, options));
  return logger;
}

module.exports = { Logger, FileHandler, createLogger, createFileLogger };
