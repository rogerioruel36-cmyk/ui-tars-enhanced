/**
 * Network Search Enhancement Module
 * Implements multi-source aggregation, result caching, smart retry, and search quality optimization
 */

const https = require('https');
const http = require('http');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

class NetworkSearcher {
  constructor(options = {}) {
    this.sources = options.sources || ['duckduckgo', 'wikipedia'];
    this.cacheDir = options.cacheDir || path.join(process.cwd(), 'workspace', 'cache');
    this.cacheTTL = options.cacheTTL || 3600000; // 1 hour default
    this.maxResults = options.maxResults || 10;
    this.timeout = options.timeout || 10000;
    this.retryAttempts = options.retryAttempts || 3;
    this.retryDelay = options.retryDelay || 1000;

    // Initialize cache
    this.cache = new Map();
    this._loadCache();

    // Ensure cache directory exists
    this._ensureCacheDir();
  }

  /**
   * Search across multiple sources
   */
  async search(query, options = {}) {
    const maxResults = options.maxResults || this.maxResults;
    const sources = options.sources || this.sources;

    // Check cache first
    const cacheKey = this._getCacheKey(query, sources);
    const cached = this._getFromCache(cacheKey);
    if (cached) {
      console.log('[Search] Cache hit for:', query);
      return cached;
    }

    // Multi-source search with smart retry
    const results = await this._multiSourceSearch(query, sources, options);

    // Quality optimization: deduplicate and rank
    const optimized = this._optimizeResults(results, maxResults);

    // Cache the results
    this._saveToCache(cacheKey, optimized);

    return optimized;
  }

  /**
   * Search across multiple sources in parallel
   */
  async _multiSourceSearch(query, sources, options) {
    const promises = sources.map(source => this._searchSource(query, source, options));
    const results = await Promise.allSettled(promises);

    const aggregated = [];
    for (let i = 0; i < results.length; i++) {
      if (results[i].status === 'fulfilled') {
        const sourceResults = results[i].value;
        sourceResults.forEach(r => {
          r._source = sources[i];
          aggregated.push(r);
        });
      } else {
        console.log(`[Search] Source ${sources[i]} failed:`, results[i].reason?.message);
      }
    }

    return aggregated;
  }

  /**
   * Search a specific source with smart retry
   */
  async _searchSource(query, source, options = {}) {
    const sourceFn = this._getSourceFunction(source);
    if (!sourceFn) {
      throw new Error(`Unknown search source: ${source}`);
    }

    return this._withRetry(() => sourceFn(query, options), {
      attempts: this.retryAttempts,
      delay: this.retryDelay
    });
  }

  /**
   * Get source search function
   */
  _getSourceFunction(source) {
    const sources = {
      bing: this._searchBing.bind(this),
      duckduckgo: this._searchDuckDuckGo.bind(this),
      wikipedia: this._searchWikipedia.bind(this),
      // Additional sources can be added here
    };
    return sources[source];
  }

  /**
   * Search Wikipedia
   */
  async _searchWikipedia(query, options = {}) {
    const encodedQuery = encodeURIComponent(query);
    const url = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodedQuery}&limit=${this.maxResults}&format=json`;

    try {
      const data = await this._fetchUrl(url);
      const json = JSON.parse(data);

      const results = [];
      if (json && json.length >= 2) {
        const titles = json[1] || [];
        const descriptions = json[2] || [];
        const urls = json[3] || [];

        for (let i = 0; i < titles.length; i++) {
          if (results.length >= this.maxResults) break;
          results.push({
            title: titles[i] || '',
            url: urls[i] || '',
            description: descriptions[i] || '',
            source: 'wikipedia'
          });
        }
      }

      return results;
    } catch (error) {
      console.log('[Search] Wikipedia search failed:', error.message);
      return [];
    }
  }

  /**
   * Search Bing (using HTML scraping)
   */
  async _searchBing(query, options = {}) {
    const encodedQuery = encodeURIComponent(query);
    const url = `https://www.bing.com/search?q=${encodedQuery}&format=rss`;

    try {
      const html = await this._fetchUrl(url);
      return this._parseBingResults(html);
    } catch (error) {
      console.log('[Search] Bing search failed:', error.message);
      return [];
    }
  }

  /**
   * Search DuckDuckGo (using their API)
   */
  async _searchDuckDuckGo(query, options = {}) {
    const encodedQuery = encodeURIComponent(query);
    // Use DuckDuckGo's instant answer API
    const url = `https://api.duckduckgo.com/?q=${encodedQuery}&format=json&no_html=1&skip_disambig=1`;

    try {
      const data = await this._fetchUrl(url);
      const json = JSON.parse(data);

      const results = [];
      if (json.RelatedTopics) {
        for (const item of json.RelatedTopics) {
          if (results.length >= this.maxResults) break;
          if (item.Text && item.FirstURL) {
            results.push({
              title: this._cleanHtml(item.Text),
              url: item.FirstURL,
              description: '',
              source: 'duckduckgo'
            });
          }
        }
      }

      return results;
    } catch (error) {
      console.log('[Search] DuckDuckGo search failed:', error.message);
      return [];
    }
  }

  /**
   * Parse Bing search results
   */
  _parseBingResults(html) {
    const results = [];
    const titleRegex = /<h2[^>]*><a[^>]*href="([^"]*)"[^>]*>([^<]*)<\/a><\/h2>/gi;
    const descRegex = /<p[^>]*class="b_caption"[^>]*>([^<]*)/gi;

    let match;
    while ((match = titleRegex.exec(html)) !== null && results.length < this.maxResults) {
      const url = match[1];
      const title = this._cleanHtml(match[2]);
      if (url && title && !url.includes('microsoft.com')) {
        results.push({
          title,
          url,
          description: '',
          source: 'bing'
        });
      }
    }

    return results;
  }

  /**
   * Parse DuckDuckGo search results
   */
  _parseDuckDuckGoResults(html) {
    const results = [];
    const resultRegex = /<a[^>]*class="result__a"[^>]*href="([^"]*)"[^>]*>([^<]*)<\/a>[\s\S]*?<a[^>]*class="result__snippet"[^>]*>([^<]*)/gi;

    let match;
    while ((match = resultRegex.exec(html)) !== null && results.length < this.maxResults) {
      const url = match[1];
      const title = this._cleanHtml(match[2]);
      const description = this._cleanHtml(match[3]);
      if (url && title) {
        results.push({
          title,
          url,
          description,
          source: 'duckduckgo'
        });
      }
    }

    return results;
  }

  /**
   * Fetch URL content
   */
  _fetchUrl(url) {
    return new Promise((resolve, reject) => {
      const protocol = url.startsWith('https') ? https : http;

      const req = protocol.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml',
        },
        timeout: this.timeout
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(data));
      });

      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
    });
  }

  /**
   * Execute function with retry logic
   */
  async _withRetry(fn, options = {}) {
    const { attempts = 3, delay = 1000 } = options;
    let lastError;

    for (let i = 0; i < attempts; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        console.log(`[Search] Attempt ${i + 1} failed:`, error.message);

        if (i < attempts - 1) {
          // Exponential backoff
          const backoffDelay = delay * Math.pow(2, i);
          await this._sleep(backoffDelay);
        }
      }
    }

    throw lastError;
  }

  /**
   * Sleep for specified milliseconds
   */
  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Optimize search results (deduplication and ranking)
   */
  _optimizeResults(results, maxResults) {
    // Deduplicate by URL domain
    const seen = new Map();
    const deduped = [];

    for (const result of results) {
      try {
        const url = new URL(result.url);
        const domain = url.hostname.replace('www.', '');

        if (!seen.has(domain)) {
          seen.set(domain, result);
          deduped.push(result);
        }
      } catch (e) {
        // Invalid URL, include anyway
        deduped.push(result);
      }
    }

    // Sort by source priority and add scores
    const scored = deduped.map((r, index) => ({
      ...r,
      _score: this._calculateScore(r, index)
    }));

    // Sort by score (descending)
    scored.sort((a, b) => b._score - a._score);

    return scored.slice(0, maxResults);
  }

  /**
   * Calculate relevance score
   */
  _calculateScore(result, index) {
    let score = 100;

    // Prefer results with descriptions
    if (result.description) score += 10;

    // Prefer well-known domains
    const trustedDomains = ['wikipedia.org', 'github.com', 'stackoverflow.com', 'medium.com', 'dev.to'];
    try {
      const domain = new URL(result.url).hostname;
      if (trustedDomains.some(d => domain.includes(d))) {
        score += 20;
      }
    } catch (e) {}

    // Position penalty
    score -= index * 2;

    return score;
  }

  /**
   * Clean HTML entities
   */
  _cleanHtml(text) {
    if (!text) return '';
    return text
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/<[^>]*>/g, '')
      .trim();
  }

  /**
   * Get cache key for query
   */
  _getCacheKey(query, sources) {
    const normalized = query.toLowerCase().trim();
    const sourceKey = sources.sort().join(',');
    return crypto.createHash('md5').update(`${normalized}:${sourceKey}`).digest('hex');
  }

  /**
   * Ensure cache directory exists
   */
  _ensureCacheDir() {
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  /**
   * Load cache from disk
   */
  _loadCache() {
    const cacheFile = path.join(this.cacheDir, 'search-cache.json');
    try {
      if (fs.existsSync(cacheFile)) {
        const data = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
        const now = Date.now();

        // Filter out expired entries
        for (const [key, value] of Object.entries(data)) {
          if (value._expires && value._expires < now) {
            delete data[key];
          } else {
            this.cache.set(key, value);
          }
        }

        // Save cleaned cache
        fs.writeFileSync(cacheFile, JSON.stringify(Object.fromEntries(this.cache), null, 2));
      }
    } catch (e) {
      console.log('[Search] Cache load failed:', e.message);
    }
  }

  /**
   * Get result from cache
   */
  _getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && cached._expires > Date.now()) {
      return cached.results;
    }
    return null;
  }

  /**
   * Save result to cache
   */
  _saveToCache(key, results) {
    const cacheFile = path.join(this.cacheDir, 'search-cache.json');
    const cacheEntry = {
      results,
      _expires: Date.now() + this.cacheTTL,
      _created: Date.now()
    };

    this.cache.set(key, cacheEntry);

    try {
      const data = Object.fromEntries(this.cache);
      fs.writeFileSync(cacheFile, JSON.stringify(data, null, 2));
    } catch (e) {
      console.log('[Search] Cache save failed:', e.message);
    }
  }

  /**
   * Clear all cached results
   */
  clearCache() {
    this.cache.clear();
    const cacheFile = path.join(this.cacheDir, 'search-cache.json');
    if (fs.existsSync(cacheFile)) {
      fs.unlinkSync(cacheFile);
    }
  }

  /**
   * Get search sources list
   */
  getSources() {
    return [...this.sources];
  }

  /**
   * Add a custom search source
   */
  addSource(name, searchFn) {
    this.sources.push(name);
    // Custom sources can be registered via _getSourceFunction override
    console.log(`[Search] Added custom source: ${name}`);
  }
}

/**
 * Factory function to create NetworkSearcher
 */
function createSearcher(options) {
  return new NetworkSearcher(options);
}

module.exports = { NetworkSearcher, createSearcher };
