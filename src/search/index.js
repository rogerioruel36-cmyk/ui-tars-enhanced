/**
 * Search Module - Network Search Enhancement
 * Provides multi-source search with caching, retry, and quality optimization
 */

const { NetworkSearcher, createSearcher } = require('./NetworkSearcher');

module.exports = {
  NetworkSearcher,
  createSearcher
};
