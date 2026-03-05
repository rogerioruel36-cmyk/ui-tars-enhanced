# Performance Optimization API

## Overview

The Performance Optimizer provides caching, parallel execution, and incremental update capabilities.

## Class: PerformanceOptimizer

```javascript
const { PerformanceOptimizer } = require('./src/utils/PerformanceOptimizer');
```

### Constructor

```javascript
new PerformanceOptimizer(options?)
```

**Parameters:**
- `options` (Object): Optional configuration
  - `cache` (Object): Cache settings
  - `parallel` (Object): Parallel execution settings

### Methods

#### cache(key, value, ttl?)

Cache a value.

```javascript
optimizer.cache('search-results', results, 3600000); // 1 hour TTL
```

#### getCached(key)

Get cached value.

```javascript
const cached = optimizer.getCached('search-results');
if (cached) {
  return cached;
}
```

#### invalidate(key)

Invalidate cache entry.

```javascript
optimizer.invalidate('search-results');
```

#### invalidatePattern(pattern)

Invalidate cache entries by pattern.

```javascript
optimizer.invalidatePattern('search-*');
```

#### clearCache()

Clear all cache.

```javascript
optimizer.clearCache();
```

#### parallel(tasks, options?)

Execute tasks in parallel.

```javascript
const results = await optimizer.parallel([
  () => fetchData1(),
  () => fetchData2(),
  () => fetchData3()
], { concurrency: 3 });
```

#### parallelMap(items, mapper, options?)

Map items in parallel.

```javascript
const results = await optimizer.parallelMap(
  [1, 2, 3, 4, 5],
  (item) => processItem(item),
  { concurrency: 2 }
);
```

#### memoize(fn, options?)

Memoize a function.

```javascript
const cachedFn = optimizer.memoize(expensiveFn, {
  ttl: 60000,
  keyGenerator: (args) => JSON.stringify(args)
});

const result1 = await cachedFn(arg1);
const result2 = await cachedFn(arg1); // From cache
```

#### incrementalUpdate(items, options?)

Perform incremental updates.

```javascript
const updates = await optimizer.incrementalUpdate(newItems, {
  keyField: 'id',
  compareFn: (old, new) => old.hash !== new.hash
});
```

### Cache Types

#### Memory Cache

```javascript
const optimizer = new PerformanceOptimizer({
  cache: {
    type: 'memory',
    maxSize: 100,
    ttl: 3600000
  }
});
```

#### File Cache

```javascript
const optimizer = new PerformanceOptimizer({
  cache: {
    type: 'file',
    dir: './workspace/cache',
    ttl: 3600000
  }
});
```

#### Redis Cache

```javascript
const optimizer = new PerformanceOptimizer({
  cache: {
    type: 'redis',
    host: 'localhost',
    port: 6379,
    ttl: 3600000
  }
});
```

## Example: Using Performance Features

```javascript
const { PerformanceOptimizer } = require('./src/utils/PerformanceOptimizer');

async function main() {
  const optimizer = new PerformanceOptimizer({
    cache: {
      type: 'memory',
      maxSize: 500,
      ttl: 3600000
    },
    parallel: {
      concurrency: 5
    }
  });

  // Caching
  const getData = async (key) => {
    const cached = optimizer.getCached(key);
    if (cached) return cached;

    const data = await fetchFromAPI(key);
    optimizer.cache(key, data, 60000);
    return data;
  };

  // Parallel execution
  const urls = [
    'https://api1.com/data',
    'https://api2.com/data',
    'https://api3.com/data'
  ];

  const results = await optimizer.parallelMap(
    urls,
    async (url) => {
      const response = await fetch(url);
      return response.json();
    },
    { concurrency: 3 }
  );

  // Memoization
  const computeExpensive = optimizer.memoize(async (n) => {
    // Expensive computation
    return n * 2;
  }, { ttl: 30000 });

  console.log(await computeExpensive(10));
  console.log(await computeExpensive(10)); // Cached

  // Incremental updates
  const existingItems = [
    { id: 1, name: 'Item 1', hash: 'abc' },
    { id: 2, name: 'Item 2', hash: 'def' }
  ];

  const newItems = [
    { id: 1, name: 'Item 1 Updated', hash: 'xyz' },
    { id: 3, name: 'Item 3', hash: 'ghi' }
  ];

  const updates = optimizer.incrementalUpdate(newItems, {
    existing: existingItems,
    keyField: 'id'
  });

  console.log('To add:', updates.add);
  console.log('To update:', updates.update);
  console.log('To delete:', updates.remove);
}

main();
```

## Example: Workflow Integration

```javascript
// workflow.json
{
  "config": {
    "performance": {
      "cache": {
        "enabled": true,
        "ttl": 3600000
      },
      "parallel": {
        "enabled": true,
        "concurrency": 3
      }
    }
  },
  "stages": [
    {
      "id": "fetch",
      "actions": [
        {
          "id": "parallel-fetch",
          "type": "parallel",
          "params": {
            "tasks": [
              { "type": "search", "params": { "query": "topic1" } },
              { "type": "search", "params": { "query": "topic2" } },
              { "type": "search", "params": { "query": "topic3" } }
            ]
          },
          "output": "searchResults"
        }
      ]
    }
  ]
}
```
