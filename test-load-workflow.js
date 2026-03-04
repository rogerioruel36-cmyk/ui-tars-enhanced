/**
 * Test loading and parsing example workflow
 */
const { WorkflowEngine } = require('./src/engine/WorkflowEngine');
const path = require('path');

async function main() {
  const engine = new WorkflowEngine();

  try {
    const template = await engine.loadTemplate(path.join(__dirname, 'workflows', 'example.json'));
    console.log('✓ Loaded workflow:', template.name);
    console.log('  Version:', template.version);
    console.log('  Stages:', template.stages.length);
    console.log('  Skills:', template.skills?.length || 0);
    console.log('\nAll validations passed!');
  } catch (e) {
    console.log('✗ Error:', e.message);
    process.exit(1);
  }
}

main();
