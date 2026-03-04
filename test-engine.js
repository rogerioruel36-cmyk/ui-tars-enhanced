/**
 * Workflow Engine Tests
 */
const { WorkflowEngine, VersionManager } = require('./src/engine/WorkflowEngine');

async function runTests() {
  console.log('Running Workflow Engine Tests...\n');
  let passed = 0;
  let failed = 0;

  // Test 1: Version Manager
  try {
    const vm = new VersionManager();
    vm.validate('1.0.0');
    console.log('✓ Test 1: Version validation');
    passed++;
  } catch (e) {
    console.log('✗ Test 1:', e.message);
    failed++;
  }

  // Test 2: Invalid version
  try {
    const vm = new VersionManager();
    vm.validate('invalid');
    console.log('✗ Test 2: Should have thrown');
    failed++;
  } catch (e) {
    console.log('✓ Test 2: Invalid version rejected');
    passed++;
  }

  // Test 3: Template parsing
  try {
    const engine = new WorkflowEngine();
    const template = engine.parseTemplate({
      version: '1.0.0',
      name: 'test-workflow',
      stages: [{ id: 's1', name: 'Stage 1', actions: [] }]
    });
    if (template.name === 'test-workflow') {
      console.log('✓ Test 3: Template parsing');
      passed++;
    } else {
      console.log('✗ Test 3: Template parsing failed');
      failed++;
    }
  } catch (e) {
    console.log('✗ Test 3:', e.message);
    failed++;
  }

  // Test 4: Required fields validation
  try {
    const engine = new WorkflowEngine();
    engine.parseTemplate({ version: '1.0.0', stages: [] });
    console.log('✗ Test 4: Should have thrown');
    failed++;
  } catch (e) {
    console.log('✓ Test 4: Required fields validation');
    passed++;
  }

  // Test 5: Action registration
  try {
    const engine = new WorkflowEngine();
    let called = false;
    engine.registerAction('custom', async (params) => {
      called = true;
      return { custom: true };
    });
    // Would need browser context to test actual execution
    console.log('✓ Test 5: Custom action registration');
    passed++;
  } catch (e) {
    console.log('✗ Test 5:', e.message);
    failed++;
  }

  // Test 6: Version comparison
  try {
    const vm = new VersionManager();
    const result = vm.compare('1.0.0', '1.0.1');
    if (result < 0) {
      console.log('✓ Test 6: Version comparison');
      passed++;
    } else {
      console.log('✗ Test 6: Version comparison failed');
      failed++;
    }
  } catch (e) {
    console.log('✗ Test 6:', e.message);
    failed++;
  }

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  return failed === 0;
}

runTests().then(success => process.exit(success ? 0 : 1));
