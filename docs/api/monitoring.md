# Monitoring API

## Overview

The Monitoring module provides logging, metrics collection, health monitoring, and error tracking.

## Class: Logger

```javascript
const { Logger } = require('./src/monitoring/Logger');
```

### Constructor

```javascript
new Logger(options?)
```

**Parameters:**
- `options` (Object): Optional configuration
  - `level` (string): Log level (debug, info, warn, error)
  - `format` (string): 'json' or 'text'
  - `output` (string|Array): Output destination(s)
  - `file` (string): Log file path

### Methods

#### debug(message, meta?)

Log debug message.

```javascript
logger.debug('Debug information', { key: 'value' });
```

#### info(message, meta?)

Log info message.

```javascript
logger.info('Operation completed', { duration: 1500 });
```

#### warn(message, meta?)

Log warning.

```javascript
logger.warn('Deprecated API used', { deprecated: 'v1.0' });
```

#### error(message, error?)

Log error.

```javascript
logger.error('Operation failed', error);
```

#### child(bindings)

Create child logger.

```javascript
const child = logger.child({ module: 'WorkflowEngine' });
child.info('Starting workflow');
```

## Class: MetricsCollector

```javascript
const { MetricsCollector } = require('./src/monitoring/MetricsCollector');
```

### Constructor

```javascript
new MetricsCollector(options?)
```

### Methods

#### recordMetric(name, value, tags?)

Record a metric.

```javascript
metrics.recordMetric('workflow.duration', 1500, { workflow: 'example' });
metrics.recordMetric('api.requests', 1, { endpoint: '/search' });
metrics.recordMetric('memory.usage', process.memoryUsage().heapUsed);
```

#### incrementCounter(name, tags?)

Increment a counter.

```javascript
metrics.incrementCounter('workflows.run');
metrics.incrementCounter('errors.total');
```

#### recordTimer(name, duration, tags?)

Record a timer.

```javascript
const timer = metrics.timer('operation.time');
await doOperation();
timer.end();
```

#### getMetrics()

Get current metrics.

```javascript
const metricsData = metrics.getMetrics();
console.log(metricsData.counters);
console.log(metricsData.gauges);
```

#### reset()

Reset all metrics.

```javascript
metrics.reset();
```

## Class: HealthMonitor

```javascript
const { HealthMonitor } = require('./src/monitoring/HealthMonitor');
```

### Constructor

```javascript
new HealthMonitor(options?)
```

### Methods

#### check()

Run health check.

```javascript
const health = await healthMonitor.check();
console.log(health.status); // 'healthy', 'degraded', 'unhealthy'
```

**Returns:**
```javascript
{
  status: 'healthy',
  checks: {
    memory: { status: 'healthy', value: '256MB' },
    cpu: { status: 'healthy', value: '45%' },
    disk: { status: 'healthy', value: '50%' }
  }
}
```

#### registerCheck(name, checkFn)

Register a custom health check.

```javascript
healthMonitor.registerCheck('database', async () => {
  try {
    await db.ping();
    return { status: 'healthy' };
  } catch (e) {
    return { status: 'unhealthy', error: e.message };
  }
});
```

#### startPeriodicChecks(interval)

Start periodic health checks.

```javascript
healthMonitor.startPeriodicChecks(60000); // Every minute
```

## Class: ErrorTracker

```javascript
const { ErrorTracker } = require('./src/monitoring/ErrorTracker');
```

### Constructor

```javascript
new ErrorTracker(options?)
```

### Methods

#### track(error, context?)

Track an error.

```javascript
try {
  await riskyOperation();
} catch (e) {
  errorTracker.track(e, { workflow: 'example' });
}
```

#### getErrors(filter?)

Get tracked errors.

```javascript
const errors = errorTracker.getErrors({ since: '2026-03-01' });
```

#### getErrorStats()

Get error statistics.

```javascript
const stats = errorTracker.getErrorStats();
console.log(stats.total);
console.log(stats.byType);
console.log(stats.byWorkflow);
```

#### clear()

Clear tracked errors.

```javascript
errorTracker.clear();
```

## Example: Complete Monitoring Setup

```javascript
const { Logger, MetricsCollector, HealthMonitor, ErrorTracker } = require('./src/monitoring');

async function main() {
  // Setup logger
  const logger = new Logger({
    level: 'debug',
    format: 'json',
    file: './logs/app.log'
  });

  // Setup metrics
  const metrics = new MetricsCollector();

  // Setup health monitor
  const healthMonitor = new HealthMonitor();

  // Setup error tracker
  const errorTracker = new ErrorTracker({
    maxErrors: 1000
  });

  // Create child logger
  const workflowLogger = logger.child({ module: 'WorkflowEngine' });

  try {
    workflowLogger.info('Starting workflow execution');

    // Record metric
    metrics.incrementCounter('workflows.started');

    // Track time
    const timer = metrics.timer('workflow.duration');

    // Execute workflow
    await executeWorkflow();

    timer.end();
    metrics.incrementCounter('workflows.completed');

    workflowLogger.info('Workflow completed successfully');

  } catch (error) {
    metrics.incrementCounter('workflows.failed');
    errorTracker.track(error, { workflow: 'example' });
    workflowLogger.error('Workflow failed', error);
  }

  // Health check
  const health = await healthMonitor.check();
  console.log('Health:', health.status);

  // Error stats
  const stats = errorTracker.getErrorStats();
  console.log('Error stats:', stats);
}

main();
```
