# Workflow Engine API

## Overview

The Workflow Engine is the core component that parses and executes JSON-based workflow templates.

## Class: WorkflowEngine

```javascript
const { WorkflowEngine } = require('./src/engine/WorkflowEngine');
```

### Constructor

```javascript
new WorkflowEngine(configManager, options?)
```

**Parameters:**
- `configManager` (ConfigManager): Configuration manager instance
- `options` (Object): Optional configuration
  - `workingDir` (string): Working directory for workflows
  - `logLevel` (string): Logging level (debug, info, warn, error)

### Methods

#### execute(workflowPath, context?)

Execute a workflow from a JSON file.

```javascript
const engine = new WorkflowEngine(config);
const result = await engine.execute('./workflows/my-workflow.json');
```

**Parameters:**
- `workflowPath` (string): Path to workflow JSON file
- `context` (Object): Execution context with variables

**Returns:** Promise<ExecutionResult>

**ExecutionResult:**
```javascript
{
  success: boolean,
  workflowId: string,
  stages: StageResult[],
  output: Object,
  metrics: {
    duration: number,
    startTime: Date,
    endTime: Date
  }
}
```

#### executeFromObject(workflow, context?)

Execute a workflow from a JavaScript object.

```javascript
const workflow = {
  version: '1.0.0',
  name: 'my-workflow',
  stages: [...]
};
const result = await engine.executeFromObject(workflow);
```

#### validate(workflowPath)

Validate a workflow JSON file against the schema.

```javascript
const errors = await engine.validate('./workflows/my-workflow.json');
if (errors.length > 0) {
  console.error('Validation errors:', errors);
}
```

#### getAvailableWorkflows()

List all available workflow templates.

```javascript
const workflows = engine.getAvailableWorkflows();
// Returns array of { path, name, description }
```

#### pause()

Pause a running workflow.

```javascript
await engine.pause();
```

#### resume()

Resume a paused workflow.

```javascript
await engine.resume();
```

#### stop()

Stop a running workflow.

```javascript
await engine.stop();
```

### Events

The engine emits events during execution:

```javascript
engine.on('stage:start', (stage) => {
  console.log('Stage started:', stage.id);
});

engine.on('stage:complete', (stage) => {
  console.log('Stage completed:', stage.id);
});

engine.on('action:start', (action) => {
  console.log('Action started:', action.id);
});

engine.on('action:complete', (action) => {
  console.log('Action completed:', action.id);
});

engine.on('error', (error) => {
  console.error('Error:', error);
});
```

## Workflow Template Structure

```json
{
  "version": "1.0.0",
  "name": "workflow-name",
  "description": "Workflow description",
  "metadata": {
    "author": "Author Name",
    "created": "2026-03-05T00:00:00Z",
    "tags": ["tag1", "tag2"],
    "category": "automation"
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
    "targetUrl": { "type": "string", "value": "https://example.com" }
  },
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
      "id": "stage-id",
      "name": "Stage Name",
      "description": "Stage description",
      "enabled": true,
      "actions": [...]
    }
  ],
  "errors": {
    "retry": { "maxAttempts": 3, "delay": 1000 },
    "fallback": "./fallback-workflow.json"
  }
}
```

## Error Handling

The engine supports automatic retry and fallback workflows:

```javascript
const result = await engine.execute('./workflow.json', {
  onError: async (error, context) => {
    // Custom error handling
    await sendAlert(error);
  }
});
```

## Example: Basic Usage

```javascript
const { WorkflowEngine } = require('./src/engine/WorkflowEngine');
const { ConfigManager } = require('./src/config/ConfigManager');

async function main() {
  const config = new ConfigManager();
  await config.load('./config/workflow.config.json');

  const engine = new WorkflowEngine(config, {
    logLevel: 'debug'
  });

  // Listen to events
  engine.on('stage:complete', (stage) => {
    console.log(`Stage ${stage.id} completed`);
  });

  // Execute workflow
  const result = await engine.execute('./workflows/example.json', {
    targetUrl: 'https://example.com'
  });

  console.log('Result:', result.success);
  console.log('Output:', result.output);
}

main();
```

## Example: Programmatic Workflow

```javascript
const workflow = {
  version: '1.0.0',
  name: 'programmatic-example',
  stages: [
    {
      id: 'init',
      name: 'Initialize',
      actions: [
        {
          id: 'navigate',
          type: 'navigate',
          params: { url: 'https://example.com' }
        },
        {
          id: 'extract-title',
          type: 'extract',
          selector: 'h1',
          output: 'pageTitle'
        }
      ]
    }
  ]
};

const result = await engine.executeFromObject(workflow);
console.log(result.output.pageTitle);
```
