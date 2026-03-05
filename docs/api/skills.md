# Skill System API

## Overview

The Skill System provides dynamic loading and execution of reusable skill packages.

## Class: SkillSystem

```javascript
const { SkillSystem } = require('./src/skills/SkillSystem');
```

### Constructor

```javascript
new SkillSystem(options?)
```

**Parameters:**
- `options` (Object): Optional configuration
  - `skillsDir` (string): Directory containing skills
  - `hotReload` (boolean): Enable hot reloading
  - `cacheEnabled` (boolean): Enable skill caching

### Methods

#### load(skillName, options?)

Load a skill by name.

```javascript
const skill = await skillSystem.load('data-extractor');
```

**Parameters:**
- `skillName` (string): Name of skill to load
- `options` (Object): Optional loading options
  - `version` (string): Specific version to load
  - `source` (string): 'local', 'npm', or 'remote'

**Returns:** Promise<Skill>

#### loadAll()

Load all available skills from the skills directory.

```javascript
const skills = await skillSystem.loadAll();
console.log('Loaded skills:', Object.keys(skills));
```

**Returns:** Promise<Object> - Map of skill name to skill instance

#### execute(skillName, params, context?)

Execute a loaded skill.

```javascript
const result = await skillSystem.execute('data-extractor', {
  selector: 'article',
  maxItems: 10
}, context);
```

**Parameters:**
- `skillName` (string): Name of skill to execute
- `params` (Object): Parameters to pass to skill
- `context` (Object): Execution context

**Returns:** Promise<any> - Skill execution result

#### unload(skillName)

Unload a skill from memory.

```javascript
await skillSystem.unload('data-extractor');
```

**Parameters:**
- `skillName` (string): Name of skill to unload

#### reload(skillName)

Hot reload a skill.

```javascript
await skillSystem.reload('data-extractor');
```

**Parameters:**
- `skillName` (string): Name of skill to reload

#### getSkill(skillName)

Get a loaded skill instance.

```javascript
const skill = skillSystem.getSkill('data-extractor');
```

**Parameters:**
- `skillName` (string): Name of skill

**Returns:** Skill|null

#### listSkills()

List all loaded skills.

```javascript
const skills = skillSystem.listSkills();
```

**Returns:** Array<SkillInfo>

## Skill Structure

A skill is a JavaScript module that exports:

```javascript
// skills/my-skill/index.js
module.exports = {
  name: 'my-skill',
  version: '1.0.0',
  description: 'My custom skill',

  // Schema for skill parameters
  schema: {
    type: 'object',
    properties: {
      param1: { type: 'string' },
      param2: { type: 'number' }
    },
    required: ['param1']
  },

  // Initialize skill
  async init(context) {
    // Setup code
  },

  // Execute skill
  async execute(params, context) {
    // Skill logic
    return { result: 'success' };
  },

  // Cleanup
  async destroy() {
    // Cleanup code
  }
};
```

## Example: Creating a Custom Skill

```javascript
// skills/data-extractor/index.js
module.exports = {
  name: 'data-extractor',
  version: '1.0.0',
  description: 'Extract structured data from web pages',

  schema: {
    type: 'object',
    properties: {
      selector: { type: 'string' },
      maxItems: { type: 'number', default: 100 },
      fields: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            selector: { type: 'string' },
            attribute: { type: 'string' }
          }
        }
      }
    },
    required: ['selector']
  },

  async init(context) {
    this.browser = context.browser;
  },

  async execute(params, context) {
    const { page } = context;
    const elements = await page.$$(params.selector);

    const results = [];
    for (const el of elements.slice(0, params.maxItems)) {
      const item = {};
      for (const field of params.fields || []) {
        if (field.attribute) {
          item[field.name] = await el.getAttribute(field.attribute);
        } else {
          item[field.name] = await el.$eval(field.selector, el => el.textContent);
        }
      }
      results.push(item);
    }

    return results;
  }
};
```

## Example: Using Skill System

```javascript
const { SkillSystem } = require('./src/skills/SkillSystem');

async function main() {
  const skillSystem = new SkillSystem({
    skillsDir: './skills',
    hotReload: true
  });

  // Load all skills
  await skillSystem.loadAll();

  // Execute a skill
  const result = await skillSystem.execute('data-extractor', {
    selector: 'article',
    fields: [
      { name: 'title', selector: 'h2' },
      { name: 'link', selector: 'a', attribute: 'href' }
    ]
  }, { page });

  console.log('Extracted:', result);

  // Reload skill after update
  await skillSystem.reload('data-extractor');
}

main();
```
