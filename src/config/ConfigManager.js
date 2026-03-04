/**
 * Configuration Management Module
 * Implements workflow.config.json parser with existing config compatibility
 */
const fs = require('fs');
const path = require('path');

class ConfigManager {
  constructor(options = {}) {
    this.configDir = options.configDir || process.cwd();
    this.configFile = options.configFile || 'workflow.config.json';
    this.cache = new Map();
    this.watcher = null;
  }

  /**
   * Load configuration from workflow.config.json
   */
  load(configPath = null) {
    const filePath = configPath || path.join(this.configDir, this.configFile);

    if (this.cache.has(filePath)) {
      return this.cache.get(filePath);
    }

    if (!fs.existsSync(filePath)) {
      throw new Error(`Config file not found: ${filePath}`);
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const config = JSON.parse(content);

    const parsed = this.parseConfig(config);
    this.cache.set(filePath, parsed);

    return parsed;
  }

  /**
   * Parse and validate configuration
   */
  parseConfig(config) {
    // Merge with defaults
    const defaults = this.getDefaults();
    const merged = this.mergeDeep(defaults, config);

    // Validate required fields
    this.validate(merged);

    // Convert legacy config format if present
    const legacy = this.convertLegacyConfig(merged);

    return {
      ...merged,
      ...legacy,
      _source: config
    };
  }

  /**
   * Get default configuration
   */
  getDefaults() {
    return {
      version: '1.0.0',
      engine: 'auto',
      browser: {
        headless: true,
        viewport: {
          width: 1920,
          height: 1080
        },
        userAgent: null,
        timeout: 30000
      },
      logging: {
        level: 'info',
        output: './logs'
      },
      workspace: {
        path: './workspace',
        cleanup: true
      },
      reports: {
        path: './reports',
        format: 'html'
      },
      retry: {
        maxAttempts: 3,
        delay: 1000,
        backoff: 'exponential'
      },
      skills: {
        autoLoad: true,
        path: './skills'
      }
    };
  }

  /**
   * Validate configuration
   */
  validate(config) {
    const errors = [];

    if (config.browser?.timeout !== undefined && config.browser.timeout < 0) {
      errors.push('browser.timeout must be non-negative');
    }

    if (config.retry?.maxAttempts !== undefined && config.retry.maxAttempts > 10) {
      errors.push('retry.maxAttempts must be <= 10');
    }

    if (config.browser?.viewport) {
      if (config.browser.viewport.width < 320 || config.browser.viewport.height < 240) {
        errors.push('viewport dimensions too small');
      }
    }

    if (errors.length > 0) {
      throw new Error(`Invalid config: ${errors.join(', ')}`);
    }

    return true;
  }

  /**
   * Convert legacy configuration format
   */
  convertLegacyConfig(config) {
    const converted = {};

    // Check for legacy agent.config.json format
    const legacy = config.legacy || config.agent;
    if (legacy) {
      converted.browser = {
        ...config.browser,
        headless: legacy.headless ?? config.browser?.headless,
        userAgent: legacy.userAgent ?? config.browser?.userAgent,
        args: legacy.args
      };
    }

    return converted;
  }

  /**
   * Merge objects deeply
   */
  mergeDeep(target, source) {
    if (!source) return target;

    const result = { ...target };

    for (const key of Object.keys(source)) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.mergeDeep(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }

    return result;
  }

  /**
   * Get specific config section
   */
  get(section) {
    const config = this.load();
    return section ? config[section] : config;
  }

  /**
   * Set config value
   */
  set(key, value) {
    const config = this.load();

    // Deep set
    const keys = key.split('.');
    let current = config;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;

    return config;
  }

  /**
   * Save configuration
   */
  save(configPath = null, config = null) {
    const filePath = configPath || path.join(this.configDir, this.configFile);
    const toSave = config || this.load();

    // Remove internal properties
    const cleaned = { ...toSave };
    delete cleaned._source;

    fs.writeFileSync(filePath, JSON.stringify(cleaned, null, 2), 'utf8');
    this.cache.set(filePath, cleaned);

    return cleaned;
  }

  /**
   * Watch configuration file for changes
   */
  watch(callback) {
    const filePath = path.join(this.configDir, this.configFile);

    if (this.watcher) {
      this.watcher.close();
    }

    try {
      const chokidar = require('chokidar');
      this.watcher = chokidar.watch(filePath);

      this.watcher.on('change', () => {
        this.cache.delete(filePath);
        const config = this.load();
        if (callback) callback(config);
      });
    } catch (e) {
      console.log('[Config] Watch not available');
    }
  }

  /**
   * Stop watching
   */
  unwatch() {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Create default config file
   */
  createDefault(configPath = null) {
    const filePath = configPath || path.join(this.configDir, this.configFile);

    if (fs.existsSync(filePath)) {
      throw new Error(`Config already exists: ${filePath}`);
    }

    const defaults = this.getDefaults();
    this.save(filePath, defaults);

    return defaults;
  }
}

module.exports = { ConfigManager };
