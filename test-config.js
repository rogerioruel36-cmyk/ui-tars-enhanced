/**
 * Configuration Manager Tests
 */
const fs = require('fs');
const path = require('path');
const { ConfigManager } = require('./src/config/ConfigManager');

const testConfigPath = path.join(__dirname, 'test-workflow.config.json');

async function runTests() {
  console.log('Running Config Manager Tests...\n');
  let passed = 0;
  let failed = 0;

  // Test 1: Load config
  try {
    const manager = new ConfigManager({ configDir: __dirname, configFile: 'agent.config.json' });
    const config = manager.load();

    if (config && config.browser) {
      console.log('✓ Test 1: Load config');
      passed++;
    } else {
      console.log('✗ Test 1: Config not loaded');
      failed++;
    }
  } catch (e) {
    console.log('✗ Test 1:', e.message);
    failed++;
  }

  // Test 2: Get defaults
  try {
    const manager = new ConfigManager();
    const defaults = manager.getDefaults();

    if (defaults.version && defaults.browser && defaults.retry) {
      console.log('✓ Test 2: Get defaults');
      passed++;
    } else {
      console.log('✗ Test 2: Incomplete defaults');
      failed++;
    }
  } catch (e) {
    console.log('✗ Test 2:', e.message);
    failed++;
  }

  // Test 3: Create default config
  try {
    const manager = new ConfigManager({ configDir: __dirname });
    if (fs.existsSync(testConfigPath)) {
      fs.unlinkSync(testConfigPath);
    }
    const config = manager.createDefault(testConfigPath);

    if (config && fs.existsSync(testConfigPath)) {
      console.log('✓ Test 3: Create default config');
      passed++;
      fs.unlinkSync(testConfigPath);
    } else {
      console.log('✗ Test 3: Config not created');
      failed++;
    }
  } catch (e) {
    console.log('✗ Test 3:', e.message);
    failed++;
  }

  // Test 4: Save and load config
  try {
    const manager = new ConfigManager({ configDir: __dirname, configFile: 'test-workflow.config.json' });
    const testConfig = { version: '1.0.0', browser: { headless: false } };
    manager.save(null, testConfig);

    const loaded = manager.load();
    if (loaded.browser.headless === false) {
      console.log('✓ Test 4: Save and load config');
      passed++;
      fs.unlinkSync(testConfigPath);
    } else {
      console.log('✗ Test 4: Config not saved correctly');
      failed++;
    }
  } catch (e) {
    console.log('✗ Test 4:', e.message);
    failed++;
  }

  // Test 5: Merge deep
  try {
    const manager = new ConfigManager();
    const target = { a: { b: { c: 1 } } };
    const source = { a: { b: { d: 2 }, e: 3 } };
    const merged = manager.mergeDeep(target, source);

    if (merged.a.b.c === 1 && merged.a.b.d === 2 && merged.a.e === 3) {
      console.log('✓ Test 5: Merge deep');
      passed++;
    } else {
      console.log('✗ Test 5: Merge failed');
      failed++;
    }
  } catch (e) {
    console.log('✗ Test 5:', e.message);
    failed++;
  }

  // Test 6: Validation
  try {
    const manager = new ConfigManager();
    const config = { browser: { timeout: -1 } };
    manager.validate(config);
    console.log('✗ Test 6: Should have validation error');
    failed++;
  } catch (e) {
    if (e.message.includes('Invalid config')) {
      console.log('✓ Test 6: Validation');
      passed++;
    } else {
      console.log('✗ Test 6:', e.message);
      failed++;
    }
  }

  // Test 7: Get section
  try {
    const manager = new ConfigManager({ configDir: __dirname, configFile: 'agent.config.json' });
    const browser = manager.get('browser');

    if (browser && browser.headless !== undefined) {
      console.log('✓ Test 7: Get section');
      passed++;
    } else {
      console.log('✗ Test 7: Section not found');
      failed++;
    }
  } catch (e) {
    console.log('✗ Test 7:', e.message);
    failed++;
  }

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  return failed === 0;
}

runTests().then(success => process.exit(success ? 0 : 1));
