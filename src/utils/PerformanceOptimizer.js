/**
 * Performance Optimization Module
 * Provides caching, parallel execution, and incremental update optimization
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

class PerformanceOptimizer {
  constructor(options = {}) {
    this.cacheDir = options.cacheDir || path.join(process.cwd(), 'workspace', 'cache');
    this.enableCache = options.enableCache !== false;
    this.enableParallel = options.enableParallel !== false;
    this.enableIncremental = options.enableIncremental !== false;

    // Initialize cache
    this.memoryCache = new Map();
    this.lruOrder = [];
    this.maxCacheSize = options.maxCacheSize || 100;
    this.defaultTTL = options.defaultTTL || 3600000; // 1 hour

    // Ensure cache directory exists
    if (this.enableCache) {
      this._ensureCacheDir();
      this._loadDiskCache();
    }

    // Performance metrics
    this.metrics = {
      cacheHits: 0,
      cacheMisses: 0,
      parallelExecutions: 0,
      skippedStages: 0,
      totalExecutions: 0
    };
  }

  /**
   * LRU Cache - Get value
   */
  get(key) {
    if (!this.enableCache) return null;

    const entry = this.memoryCache.get(key);
    if (!entry) {
      this.metrics.cacheMisses++;
      return null;
    }

    // Check TTL
    if (entry.expires && entry.expires < Date.now()) {
      this.memoryCache.delete(key);
      this._removeFromLRU(key);
      this.metrics.cacheMisses++;
      return null;
    }

    // Update LRU order
    this._updateLRU(key);
    this.metrics.cacheHits++;

    return entry.value;
  }

  /**
   * LRU Cache - Set value
   */
  set(key, value, ttl = this.defaultTTL) {
    if (!this.enableCache) return;

    // Evict if at capacity
    if (this.memoryCache.size >= this.maxCacheSize && !this.memoryCache.has(key)) {
      this._evictLRU();
    }

    const entry = {
      value,
      expires: ttl > 0 ? Date.now() + ttl : null,
      created: Date.now()
    };

    this.memoryCache.set(key, entry);
    this._updateLRU(key);

    // Persist to disk for durability
    this._persistCacheEntry(key, entry);
  }

  /**
   * LRU Cache - Delete value
   */
  delete(key) {
    this.memoryCache.delete(key);
    this._removeFromLRU(key);
    this._removeDiskCache(key);
  }

  /**
   * LRU Cache - Clear all
   */
  clearCache() {
    this.memoryCache.clear();
    this.lruOrder = [];
    this.metrics.cacheHits = 0;
    this.metrics.cacheMisses = 0;
  }

  /**
   * Parallel execution helper
   * Executes independent tasks in parallel with concurrency limit
   */
  async parallelExec(tasks, options = {}) {
    if (!this.enableParallel) {
      return this._sequentialExec(tasks);
    }

    const { concurrency = 5, stopOnError = false } = options;
    this.metrics.parallelExecutions++;

    const results = [];
    const errors = [];
    let currentIndex = 0;

    const workers = [];
    for (let i = 0; i < Math.min(concurrency, tasks.length); i++) {
      workers.push(this._worker(tasks, results, errors, stopOnError, () => currentIndex++, currentIndex++));
    }

    await Promise.all(workers);
    return { results, errors };
  }

  async _worker(tasks, results, errors, stopOnError, getNextIndex, startIndex) {
    let index = startIndex;
    while (index < tasks.length) {
      if (stopOnError && errors.length > 0) break;

      const task = tasks[index];
      try {
        const result = await task();
        results.push({ index, result });
      } catch (error) {
        errors.push({ index, error: error.message });
      }

      index = getNextIndex();
    }
  }

  async _sequentialExec(tasks) {
    const results = [];
    const errors = [];
    for (let i = 0; i < tasks.length; i++) {
      try {
        const result = await tasks[i]();
        results.push({ index: i, result });
      } catch (error) {
        errors.push({ index: i, error: error.message });
      }
    }
    return { results, errors };
  }

  /**
   * Compute content hash for incremental updates
   */
  computeHash(content, algorithm = 'md5') {
    if (typeof content === 'object') {
      content = JSON.stringify(content);
    }
    return crypto.createHash(algorithm).update(String(content)).digest('hex');
  }

  /**
   * Compute file hash
   */
  computeFileHash(filePath, algorithm = 'md5') {
    if (!fs.existsSync(filePath)) {
      return null;
    }
    const content = fs.readFileSync(filePath);
    return crypto.createHash(algorithm).update(content).digest('hex');
  }

  /**
   * Incremental update - Check if content changed
   */
  async checkIncremental(key, content, options = {}) {
    if (!this.enableIncremental) {
      return { changed: true, reason: 'incremental_disabled' };
    }

    const { algorithm = 'md5', storePath = null } = options;
    const newHash = this.computeHash(content, algorithm);

    // Check memory cache first
    const cached = this.memoryCache.get(`hash:${key}`);
    if (cached && cached.value === newHash) {
      this.metrics.skippedStages++;
      return { changed: false, reason: 'hash_match', hash: newHash };
    }

    // Check disk cache
    if (storePath) {
      const diskHashPath = path.join(storePath, `${key}.hash`);
      if (fs.existsSync(diskHashPath)) {
        const storedHash = fs.readFileSync(diskHashPath, 'utf8').trim();
        if (storedHash === newHash) {
          // Update memory cache
          this.memoryCache.set(`hash:${key}`, { value: newHash, expires: null, created: Date.now() });
          this.metrics.skippedStages++;
          return { changed: false, reason: 'hash_match', hash: newHash };
        }
      }
    }

    // Content changed or not found
    return { changed: true, reason: 'hash_mismatch', hash: newHash };
  }

  /**
   * Save hash for incremental update
   */
  async saveHash(key, hash, storePath = null) {
    if (!this.enableIncremental) return;

    // Save to memory
    this.memoryCache.set(`hash:${key}`, { value: hash, expires: null, created: Date.now() });

    // Save to disk
    if (storePath) {
      const hashPath = path.join(storePath, `${key}.hash`);
      fs.writeFileSync(hashPath, hash);
    }
  }

  /**
   * Debounce function calls
   */
  debounce(fn, delay) {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  /**
   * Throttle function calls
   */
  throttle(fn, limit) {
    let inThrottle;
    return (...args) => {
      if (!inThrottle) {
        fn.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  /**
   * Memoize async function
   */
  memoizeAsync(fn, options = {}) {
    const { ttl = this.defaultTTL, hashFn = null } = options;
    const cache = new Map();

    return async (...args) => {
      const key = hashFn ? hashFn(...args) : JSON.stringify(args);

      const cached = cache.get(key);
      if (cached && (!cached.expires || cached.expires > Date.now())) {
        return cached.value;
      }

      const value = await fn(...args);
      cache.set(key, { value, expires: ttl > 0 ? Date.now() + ttl : null });
      return value;
    };
  }

  /**
   * Get performance metrics
   */
  getMetrics() {
    const hitRate = this.metrics.totalExecutions > 0
      ? (this.metrics.cacheHits / this.metrics.totalExecutions * 100).toFixed(2)
      : 0;

    return {
      ...this.metrics,
      cacheHitRate: `${hitRate}%`,
      cacheSize: this.memoryCache.size,
      timestamp: Date.now()
    };
  }

  /**
   * Reset metrics
   */
  resetMetrics() {
    this.metrics = {
      cacheHits: 0,
      cacheMisses: 0,
      parallelExecutions: 0,
      skippedStages: 0,
      totalExecutions: 0
    };
  }

  // Private methods

  _ensureCacheDir() {
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  _loadDiskCache() {
    const cacheFile = path.join(this.cacheDir, 'perf-cache.json');
    try {
      if (fs.existsSync(cacheFile)) {
        const data = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
        const now = Date.now();

        for (const [key, entry] of Object.entries(data)) {
          if (entry.expires && entry.expires < now) {
            continue; // Skip expired
          }
          this.memoryCache.set(key, entry);
          this.lruOrder.push(key);
        }
      }
    } catch (e) {
      console.log('[Performance] Cache load failed:', e.message);
    }
  }

  _persistCacheEntry(key, entry) {
    const cacheFile = path.join(this.cacheDir, 'perf-cache.json');
    try {
      let data = {};
      if (fs.existsSync(cacheFile)) {
        data = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
      }
      data[key] = entry;
      fs.writeFileSync(cacheFile, JSON.stringify(data, null, 2));
    } catch (e) {
      console.log('[Performance] Cache persist failed:', e.message);
    }
  }

  _removeDiskCache(key) {
    const cacheFile = path.join(this.cacheDir, 'perf-cache.json');
    try {
      if (fs.existsSync(cacheFile)) {
        const data = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
        delete data[key];
        fs.writeFileSync(cacheFile, JSON.stringify(data, null, 2));
      }
    } catch (e) {
      // Ignore
    }
  }

  _updateLRU(key) {
    this._removeFromLRU(key);
    this.lruOrder.push(key);
  }

  _removeFromLRU(key) {
    const index = this.lruOrder.indexOf(key);
    if (index > -1) {
      this.lruOrder.splice(index, 1);
    }
  }

  _evictLRU() {
    if (this.lruOrder.length > 0) {
      const oldest = this.lruOrder.shift();
      this.memoryCache.delete(oldest);
      this._removeDiskCache(oldest);
    }
  }
}

// Singleton instance
let instance = null;

function createPerformanceOptimizer(options) {
  if (!instance) {
    instance = new PerformanceOptimizer(options);
  }
  return instance;
}

function getPerformanceOptimizer() {
  return instance;
}

module.exports = { PerformanceOptimizer, createPerformanceOptimizer, getPerformanceOptimizer };
