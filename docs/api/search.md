# Network Search API

## Overview

The Network Searcher provides multi-source aggregated search with caching and retry capabilities.

## Class: NetworkSearcher

```javascript
const { NetworkSearcher } = require('./src/search/NetworkSearcher');
```

### Constructor

```javascript
new NetworkSearcher(options?)
```

**Parameters:**
- `options` (Object): Optional configuration
  - `sources` (Array): Search sources to use
  - `cache` (Object): Cache configuration
  - `retry` (Object): Retry configuration

### Methods

#### search(query, options?)

Perform a multi-source search.

```javascript
const searcher = new NetworkSearcher();

const results = await searcher.search('artificial intelligence news', {
  sources: ['google', 'bing', 'news'],
  limit: 20,
  language: 'en'
});
```

**Parameters:**
- `query` (string): Search query
- `options` (Object): Search options
  - `sources` (Array): Sources to query
  - `limit` (number): Max results
  - `language` (string): Language filter
  - `region` (string): Region filter
  - `timeRange` (string): 'day', 'week', 'month', 'year'
  - `useCache` (boolean): Use cached results

**Returns:** Promise<SearchResults>

**SearchResults:**
```javascript
{
  query: 'search query',
  total: 20,
  results: [
    {
      title: 'Result Title',
      url: 'https://example.com',
      snippet: 'Result description...',
      source: 'google',
      score: 0.95,
      date: '2026-03-01'
    }
  ],
  metadata: {
    cached: false,
    executionTime: 1500
  }
}
```

#### searchSingle(query, source, options?)

Search a single source.

```javascript
const results = await searcher.searchSingle('AI', 'google', {
  limit: 10
});
```

#### getCachedResults(query)

Get cached results for a query.

```javascript
const cached = searcher.getCachedResults('previous query');
if (cached) {
  console.log('Cached results:', cached.results);
}
```

#### clearCache()

Clear the search cache.

```javascript
await searcher.clearCache();
```

#### addSource(sourceConfig)

Add a custom search source.

```javascript
searcher.addSource({
  name: 'custom',
  type: 'api',
  endpoint: 'https://api.example.com/search',
  apiKey: 'your-api-key'
});
```

### Available Sources

- `google` - Google search
- `bing` - Bing search
- `news` - News aggregator
- `academic` - Academic papers
- `images` - Image search
- `video` - Video search

## Example: Complete Search

```javascript
const { NetworkSearcher } = require('./src/search/NetworkSearcher');

async function main() {
  const searcher = new NetworkSearcher({
    sources: ['google', 'bing', 'news'],
    cache: {
      enabled: true,
      ttl: 3600000, // 1 hour
      dir: './workspace/cache'
    },
    retry: {
      maxAttempts: 3,
      delay: 1000,
      backoff: 'exponential'
    }
  });

  // Simple search
  const results = await searcher.search('latest AI developments');

  console.log(`Found ${results.total} results`);
  console.log('Top result:', results.results[0].title);

  // Advanced search with filters
  const advancedResults = await searcher.search('machine learning', {
    sources: ['google', 'academic'],
    limit: 50,
    language: 'en',
    timeRange: 'month',
    useCache: true
  });

  // Process results
  for (const result of advancedResults.results) {
    console.log(`[${result.source}] ${result.title}`);
    console.log(`  ${result.url}`);
    console.log(`  ${result.snippet}`);
  }

  // Clear cache when needed
  await searcher.clearCache();
}

main();
```

## Example: Integrating with Workflow

```javascript
// workflow.json
{
  "stages": [
    {
      "id": "research",
      "name": "Research Topic",
      "actions": [
        {
          "id": "search",
          "type": "search",
          "params": {
            "query": "{{topic}}",
            "sources": ["google", "news"],
            "limit": 10
          },
          "output": "searchResults"
        },
        {
          "id": "extract-content",
          "type": "skill",
          "skill": "content-extractor",
          "skillParams": {
            "urls": "${searchResults[*].url}"
          },
          "output": "articles"
        }
      ]
    }
  ]
}
```
