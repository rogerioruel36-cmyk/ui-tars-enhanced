# Writing Workflows

## Workflow Structure

A workflow is a JSON file that defines a sequence of stages and actions:

```json
{
  "version": "1.0.0",
  "name": "my-workflow",
  "description": "Description of what this workflow does",
  "metadata": {
    "author": "Your Name",
    "created": "2026-03-05T00:00:00Z",
    "tags": ["tag1", "tag2"],
    "category": "automation"
  },
  "config": {
    "timeout": 300000,
    "retry": 3,
    "browser": {
      "engine": "puppeteer",
      "headless": true
    }
  },
  "variables": {
    "myVariable": {
      "type": "string",
      "value": "default value"
    }
  },
  "skills": [...],
  "stages": [
    {
      "id": "stage-1",
      "name": "Stage Name",
      "description": "What this stage does",
      "actions": [...]
    }
  ],
  "errors": {...}
}
```

## Variables

Define workflow-level variables:

```json
{
  "variables": {
    "targetUrl": {
      "type": "string",
      "value": "https://example.com"
    },
    "maxItems": {
      "type": "number",
      "value": 10
    },
    "enabled": {
      "type": "boolean",
      "value": true
    },
    "config": {
      "type": "object",
      "value": {
        "key": "value"
      }
    }
  }
}
```

Use variables in actions:

```json
{
  "actions": [
    {
      "type": "navigate",
      "params": {
        "url": "{{targetUrl}}"
      }
    }
  ]
}
```

## Actions

### Browser Actions

```json
{
  "id": "browse",
  "type": "navigate",
  "params": {
    "url": "https://example.com",
    "waitUntil": "networkidle2"
  }
}
```

```json
{
  "id": "click-button",
  "type": "click",
  "selector": "#submit-btn",
  "params": {
    "delay": 100
  }
}
```

```json
{
  "id": "fill-form",
  "type": "type",
  "selector": "#username",
  "params": {
    "value": "user123",
    "clear": true
  }
}
```

### Data Actions

```json
{
  "id": "extract-data",
  "type": "extract",
  "selector": "article",
  "output": "articles",
  "loop": {
    "maxItems": 20
  }
}
```

```json
{
  "id": "run-script",
  "type": "evaluate",
  "script": "document.title",
  "output": "pageTitle"
}
```

### Search Actions

```json
{
  "id": "search",
  "type": "search",
  "params": {
    "query": "{{topic}}",
    "sources": ["google", "bing"],
    "limit": 10
  },
  "output": "results"
}
```

### Skill Actions

```json
{
  "id": "custom-action",
  "type": "skill",
  "skill": "my-skill",
  "skillParams": {
    "param1": "value1",
    "param2": 123
  },
  "output": "skillResult"
}
```

### File Actions

```json
{
  "id": "save-data",
  "type": "file",
  "params": {
    "operation": "write",
    "path": "./output/data.json",
    "content": "{{results}}"
  }
}
```

## Stages

Stages are executed sequentially by default:

```json
{
  "stages": [
    {
      "id": "stage-1",
      "name": "First Stage",
      "actions": [...]
    },
    {
      "id": "stage-2",
      "name": "Second Stage",
      "actions": [...]
    }
  ]
}
```

### Conditional Stages

```json
{
  "id": "optional-stage",
  "name": "Optional Stage",
  "condition": "{{enableStage2}} === true",
  "actions": [...]
}
```

### Error Handling

```json
{
  "id": "stage",
  "actions": [
    {
      "id": "risky-action",
      "type": "navigate",
      "retry": 3,
      "onError": {
        "action": "fallback",
        "message": "Navigation failed"
      }
    }
  ]
}
```

## Loops

### Loop Over Array

```json
{
  "id": "process-items",
  "type": "loop",
  "loop": {
    "over": "{{items}}",
    "variable": "item"
  },
  "actions": [
    {
      "type": "skill",
      "skill": "process-item",
      "skillParams": {
        "item": "{{item}}"
      }
    }
  ]
}
```

### Loop Count

```json
{
  "id": "retry-action",
  "type": "loop",
  "loop": {
    "count": 5,
    "delay": 1000
  },
  "actions": [...]
}
```

## Parallel Execution

Execute actions in parallel:

```json
{
  "id": "parallel-fetch",
  "type": "parallel",
  "params": {
    "tasks": [
      { "type": "navigate", "params": { "url": "https://a.com" } },
      { "type": "navigate", "params": { "url": "https://b.com" } },
      { "type": "navigate", "params": { "url": "https://c.com" } }
    ]
  },
  "output": "pages"
}
```

## Workflow-Level Error Handling

```json
{
  "errors": {
    "retry": {
      "maxAttempts": 3,
      "delay": 1000,
      "backoff": "exponential"
    },
    "continueOnError": false,
    "fallback": "./fallback-workflow.json",
    "notify": {
      "on": ["error"],
      "channel": "email",
      "config": {
        "to": "admin@example.com"
      }
    }
  }
}
```

## Complete Example

```json
{
  "version": "1.0.0",
  "name": "ecommerce-scraper",
  "description": "Scrape product data from e-commerce site",
  "metadata": {
    "author": "UI-TARS Team",
    "tags": ["ecommerce", "scraping"],
    "category": "scraping"
  },
  "config": {
    "timeout": 300000,
    "retry": 3,
    "browser": {
      "engine": "puppeteer",
      "headless": true,
      "viewport": { "width": 1920, "height": 1080 }
    }
  },
  "variables": {
    "baseUrl": {
      "type": "string",
      "value": "https://shop.example.com"
    },
    "category": {
      "type": "string",
      "value": "electronics"
    }
  },
  "stages": [
    {
      "id": "navigate",
      "name": "Navigate to Category",
      "actions": [
        {
          "id": "goto",
          "type": "navigate",
          "params": {
            "url": "{{baseUrl}}/{{category}}"
          }
        },
        {
          "id": "wait",
          "type": "wait",
          "params": {
            "ms": 2000
          }
        }
      ]
    },
    {
      "id": "extract",
      "name": "Extract Products",
      "actions": [
        {
          "id": "products",
          "type": "extract",
          "selector": ".product-item",
          "output": "products",
          "loop": {
            "maxItems": 50
          }
        }
      ]
    },
    {
      "id": "save",
      "name": "Save Results",
      "actions": [
        {
          "id": "write",
          "type": "file",
          "params": {
            "operation": "write",
            "path": "./workspace/products.json",
            "content": "{{products}}"
          }
        }
      ]
    }
  ]
}
```

## Validation

Validate your workflow against the schema:

```javascript
const { WorkflowEngine } = require('./src/engine/WorkflowEngine');

const engine = new WorkflowEngine(config);
const errors = await engine.validate('./workflow.json');

if (errors.length > 0) {
  console.error('Validation errors:', errors);
}
```
