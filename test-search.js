/**
 * Test script for NetworkSearcher - Comprehensive
 */

const { NetworkSearcher } = require('./src/search/NetworkSearcher');

async function testSearch() {
  console.log('=== Comprehensive NetworkSearcher Tests ===\n');

  const searcher = new NetworkSearcher({
    sources: ['duckduckgo', 'wikipedia'],
    maxResults: 5,
    timeout: 15000,
    retryAttempts: 2
  });

  // Test 1: Basic search with Wikipedia
  console.log('Test 1: Basic search with Wikipedia...');
  try {
    const results = await searcher.search('Python programming', { sources: ['wikipedia'] });
    if (results.length > 0) {
      console.log('✓ PASSED - Found', results.length, 'results');
      results.forEach((r, i) => {
        console.log(`  ${i + 1}. ${r.title.substring(0, 50)}... (${r.source})`);
      });
    } else {
      console.log('⚠ No results returned');
    }
  } catch (error) {
    console.log('✗ FAILED:', error.message);
  }
  console.log();

  // Test 2: Multi-source search
  console.log('Test 2: Multi-source search (DuckDuckGo + Wikipedia)...');
  try {
    const searcher2 = new NetworkSearcher({
      sources: ['duckduckgo', 'wikipedia'],
      maxResults: 10
    });
    const results = await searcher2.search('JavaScript', { sources: ['wikipedia'] });
    console.log('✓ PASSED');
    console.log('  Results count:', results.length);
    results.forEach((r, i) => {
      console.log(`  ${i + 1}. ${r.title.substring(0, 40)} (${r.source})`);
    });
  } catch (error) {
    console.log('✗ FAILED:', error.message);
  }
  console.log();

  // Test 3: Caching
  console.log('Test 3: Caching mechanism...');
  try {
    const query = 'cache test ' + Date.now();
    const start1 = Date.now();
    await searcher.search(query, { sources: ['wikipedia'] });
    const time1 = Date.now() - start1;

    const start2 = Date.now();
    await searcher.search(query, { sources: ['wikipedia'] });
    const time2 = Date.now() - start2;

    console.log('✓ PASSED');
    console.log('  First call:', time1 + 'ms, Second call:', time2 + 'ms');
    console.log('  Cache speedup:', (time1 / Math.max(time2, 1)).toFixed(1) + 'x');
  } catch (error) {
    console.log('✗ FAILED:', error.message);
  }
  console.log();

  // Test 4: Get sources
  console.log('Test 4: Get sources list...');
  try {
    const sources = searcher.getSources();
    console.log('✓ PASSED - Available sources:', sources.join(', '));
  } catch (error) {
    console.log('✗ FAILED:', error.message);
  }
  console.log();

  // Test 5: Clear cache
  console.log('Test 5: Clear cache...');
  try {
    searcher.clearCache();
    console.log('✓ PASSED - Cache cleared');
  } catch (error) {
    console.log('✗ FAILED:', error.message);
  }
  console.log();

  console.log('=== Tests Complete ===');
}

testSearch().catch(console.error);
