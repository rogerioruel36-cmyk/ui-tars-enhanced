/**
 * Skill System Tests
 */
const path = require('path');
const { SkillLoader, DependencyResolver } = require('./src/skills/SkillSystem');

async function runTests() {
  console.log('Running Skill System Tests...\n');
  let passed = 0;
  let failed = 0;

  // Test 1: Load skill from directory
  try {
    const loader = new SkillLoader();
    const skillPath = path.join(__dirname, 'skills', 'data-extractor');
    const skill = await loader.load(skillPath, { name: 'data-extractor', version: '1.0.0' });

    if (skill && skill.name === 'data-extractor' && skill.handler) {
      console.log('✓ Test 1: Load skill from directory');
      passed++;
    } else {
      console.log('✗ Test 1: Skill not loaded correctly');
      failed++;
    }
  } catch (e) {
    console.log('✗ Test 1:', e.message);
    failed++;
  }

  // Test 2: Get loaded skill
  try {
    const loader = new SkillLoader();
    const skillPath = path.join(__dirname, 'skills', 'data-extractor');
    await loader.load(skillPath, { name: 'data-extractor', version: '1.0.0' });

    const skill = loader.get('data-extractor');
    if (skill && skill.version === '1.0.0') {
      console.log('✓ Test 2: Get loaded skill');
      passed++;
    } else {
      console.log('✗ Test 2: Skill not found');
      failed++;
    }
  } catch (e) {
    console.log('✗ Test 2:', e.message);
    failed++;
  }

  // Test 3: Get all skills
  try {
    const loader = new SkillLoader();
    const skillPath = path.join(__dirname, 'skills', 'data-extractor');
    await loader.load(skillPath, { name: 'data-extractor', version: '1.0.0' });

    const all = loader.getAll();
    if (all.length === 1 && all[0].name === 'data-extractor') {
      console.log('✓ Test 3: Get all skills');
      passed++;
    } else {
      console.log('✗ Test 3: Incorrect skills list');
      failed++;
    }
  } catch (e) {
    console.log('✗ Test 3:', e.message);
    failed++;
  }

  // Test 4: Unload skill
  try {
    const loader = new SkillLoader();
    const skillPath = path.join(__dirname, 'skills', 'data-extractor');
    await loader.load(skillPath, { name: 'data-extractor', version: '1.0.0' });
    loader.unload('data-extractor');

    const skill = loader.get('data-extractor');
    if (!skill) {
      console.log('✓ Test 4: Unload skill');
      passed++;
    } else {
      console.log('✗ Test 4: Skill still loaded');
      failed++;
    }
  } catch (e) {
    console.log('✗ Test 4:', e.message);
    failed++;
  }

  // Test 5: Dependency resolver
  try {
    const resolver = new DependencyResolver();
    const skills = [
      { name: 'a', dependencies: ['b', 'c'] },
      { name: 'b', dependencies: ['c'] },
      { name: 'c', dependencies: [] }
    ];

    const sorted = resolver.topologicalSort(skills);
    const names = sorted.map(s => s.name);

    // c should come first, then b, then a
    if (names.indexOf('c') < names.indexOf('b') && names.indexOf('b') < names.indexOf('a')) {
      console.log('✓ Test 5: Dependency resolution');
      passed++;
    } else {
      console.log('✗ Test 5: Incorrect sort order:', names);
      failed++;
    }
  } catch (e) {
    console.log('✗ Test 5:', e.message);
    failed++;
  }

  // Test 6: Circular dependency detection
  try {
    const resolver = new DependencyResolver();
    const skills = [
      { name: 'a', dependencies: ['b'] },
      { name: 'b', dependencies: ['a'] }
    ];

    resolver.topologicalSort(skills);
    console.log('✗ Test 6: Should have detected circular dependency');
    failed++;
  } catch (e) {
    if (e.message.includes('Circular')) {
      console.log('✓ Test 6: Circular dependency detection');
      passed++;
    } else {
      console.log('✗ Test 6:', e.message);
      failed++;
    }
  }

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  return failed === 0;
}

runTests().then(success => process.exit(success ? 0 : 1));
