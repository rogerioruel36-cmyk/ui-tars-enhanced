# Creating Custom Skills

## Skill Structure

A skill is a JavaScript module that exports:

```javascript
module.exports = {
  name: 'my-skill',
  version: '1.0.0',
  description: 'Description of what the skill does',

  // Schema for parameters (optional but recommended)
  schema: {
    type: 'object',
    properties: {
      param1: { type: 'string' },
      param2: { type: 'number' }
    },
    required: ['param1']
  },

  // Initialize skill (optional)
  async init(context) {
    // Setup code, e.g., establish connections
    this.context = context;
  },

  // Execute skill (required)
  async execute(params, context) {
    // Skill logic
    return { result: 'success' };
  },

  // Cleanup (optional)
  async destroy() {
    // Cleanup code
  }
};
```

## Skill Context

The context object passed to skills includes:

```javascript
{
  browser: BrowserEnhancer,
  page: PuppeteerPage | PlaywrightPage,
  variables: Object,
  logger: Logger,
  metrics: MetricsCollector
}
```

## Example: Data Extractor Skill

```javascript
// skills/data-extractor/index.js
module.exports = {
  name: 'data-extractor',
  version: '1.0.0',
  description: 'Extract structured data from web pages',

  schema: {
    type: 'object',
    properties: {
      selector: {
        type: 'string',
        description: 'CSS selector for elements to extract'
      },
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
      },
      maxItems: {
        type: 'number',
        default: 100
      }
    },
    required: ['selector']
  },

  async execute(params, context) {
    const { page } = context;
    const elements = await page.$$(params.selector);

    const results = [];
    const limit = params.maxItems || 100;

    for (const el of elements.slice(0, limit)) {
      const item = {};

      if (params.fields) {
        for (const field of params.fields) {
          if (field.attribute) {
            item[field.name] = await el.getAttribute(field.attribute);
          } else {
            item[field.name] = await el.$eval(field.selector, el => el.textContent.trim());
          }
        }
      } else {
        item.text = await el.textContent();
      }

      results.push(item);
    }

    return results;
  }
};
```

## Example: Email Classifier Skill

```javascript
// skills/email-classifier/index.js
module.exports = {
  name: 'email-classifier',
  version: '1.0.0',
  description: 'Classify emails by category',

  schema: {
    type: 'object',
    properties: {
      emails: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            subject: { type: 'string' },
            body: { type: 'string' },
            from: { type: 'string' }
          }
        }
      }
    }
  },

  async execute(params, context) {
    const categories = {
      work: [],
      personal: [],
      promotions: [],
      other: []
    };

    const keywords = {
      work: ['meeting', 'project', 'deadline', 'team'],
      personal: ['friend', 'family', 'personal', 'birthday'],
      promotions: ['sale', 'offer', 'discount', 'buy']
    };

    for (const email of params.emails) {
      const text = `${email.subject} ${email.body}`.toLowerCase();

      let categorized = false;
      for (const [category, words] of Object.entries(keywords)) {
        if (words.some(w => text.includes(w))) {
          categories[category].push(email);
          categorized = true;
          break;
        }
      }

      if (!categorized) {
        categories.other.push(email);
      }
    }

    return categories;
  }
};
```

## Loading Skills

### In Workflow

```json
{
  "skills": [
    {
      "name": "data-extractor",
      "version": "1.0.0",
      "source": "local",
      "path": "./skills/data-extractor"
    }
  ],
  "stages": [
    {
      "actions": [
        {
          "type": "skill",
          "skill": "data-extractor",
          "skillParams": {
            "selector": "article"
          },
          "output": "data"
        }
      ]
    }
  ]
}
```

### Programmatically

```javascript
const { SkillSystem } = require('./src/skills/SkillSystem');

const skillSystem = new SkillSystem({
  skillsDir: './skills'
});

await skillSystem.loadAll();

const result = await skillSystem.execute('data-extractor', {
  selector: 'article'
}, context);
```

## Skill Best Practices

1. **Always define a schema** - Helps with validation
2. **Handle errors gracefully** - Return meaningful error messages
3. **Clean up resources** - Use the `destroy` method
4. **Log important actions** - Use the context logger
5. **Be idempotent** - Same input should produce same output
