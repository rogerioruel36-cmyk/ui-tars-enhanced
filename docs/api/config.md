# Config Manager API

## Overview

The Config Manager handles loading and parsing of workflow configurations.

## Class: ConfigManager

```javascript
const { ConfigManager } = require('./src/config/ConfigManager');
```

### Constructor

```javascript
new ConfigManager(options?)
```

**Parameters:**
- `options` (Object): Optional configuration
  - `configPath` (string): Default config path
  - `validate` (boolean): Enable schema validation
  - `schema` (Object): Custom JSON schema

### Methods

#### load(configPath)

Load configuration from a JSON file.

```javascript
const config = new ConfigManager();
await config.load('./workflow.config.json');
```

**Parameters:**
- `configPath` (string): Path to config file

**Returns:** Promise<Object> - Loaded configuration

#### get(key)

Get a configuration value by key.

```javascript
const browserConfig = config.get('browser');
const timeout = config.get('timeout', 30000); // Default value
```

**Parameters:**
- `key` (string): Configuration key (supports dot notation)
- `defaultValue` (any): Default value if key not found

**Returns:** any - Configuration value

#### set(key, value)

Set a configuration value.

```javascript
config.set('browser.headless', false);
config.set('custom.setting', { foo: 'bar' });
```

**Parameters:**
- `key` (string): Configuration key
- `value` (any): Value to set

#### merge(newConfig)

Merge new configuration with existing.

```javascript
config.merge({
  timeout: 60000,
  newSetting: 'value'
});
```

**Parameters:**
- `newConfig` (Object): Configuration to merge

#### validate(config)

Validate configuration against schema.

```javascript
const errors = config.validate(myConfig);
if (errors.length > 0) {
  console.error('Validation errors:', errors);
}
```

**Parameters:**
- `config` (Object): Configuration to validate

**Returns:** Array<ValidationError>

#### save(configPath?)

Save current configuration to file.

```javascript
await config.save('./my-config.json');
```

**Parameters:**
- `configPath` (string): Optional path, uses original if not provided

#### reset()

Reset configuration to defaults.

```javascript
config.reset();
```

## Configuration Schema

```json
{
  "version": "1.0.0",
  "browser": {
    "engine": "puppeteer",
    "headless": true,
    "viewport": {
      "width": 1920,
      "height": 1080
    },
    "userAgent": "Mozilla/5.0...",
    "proxy": "http://proxy:8080"
  },
  "timeout": 300000,
  "retry": {
    "maxAttempts": 3,
    "delay": 1000,
    "backoff": "exponential"
  },
  "logging": {
    "level": "info",
    "file": "./logs/workflow.log",
    "format": "json"
  },
  "skills": {
    "dir": "./skills",
    "autoLoad": true,
    "hotReload": true
  },
  "reports": {
    "dir": "./reports",
    "defaultStyle": "professional",
    "pdfOptions": {
      "format": "A4",
      "margin": "10mm"
    }
  },
  "cache": {
    "enabled": true,
    "dir": "./workspace/cache",
    "ttl": 3600000
  }
}
```

## Example: Loading Configuration

```javascript
const { ConfigManager } = require('./src/config/ConfigManager');

async function main() {
  const config = new ConfigManager();

  // Load from file
  await config.load('./config/workflow.config.json');

  // Get values
  const browserEngine = config.get('browser.engine');
  const timeout = config.get('timeout', 30000);

  // Modify config
  config.set('browser.headless', false);
  config.set('custom.newSetting', { key: 'value' });

  // Validate
  const errors = config.validate(config.getAll());
  if (errors.length === 0) {
    console.log('Configuration is valid');
  }

  // Save
  await config.save('./config/modified-config.json');
}

main();
```

## Example: Environment-specific Config

```javascript
const { ConfigManager } = require('./src/config/ConfigManager');

async function loadEnvConfig(env = 'development') {
  const config = new ConfigManager();

  // Load base config
  await config.load('./config/base.json');

  // Merge environment-specific config
  if (env === 'production') {
    await config.merge(require('./config/production.json'));
  } else if (env === 'test') {
    await config.merge(require('./config/test.json'));
  }

  return config;
}

const config = await loadEnvConfig(process.env.NODE_ENV);
```
