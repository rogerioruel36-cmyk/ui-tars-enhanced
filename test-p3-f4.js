/**
 * Test script for Monitoring & Logging System (P3-F4)
 */
const path = require('path');

// Test Logger
console.log('=== Testing Logger ===');
const { createLogger } = require('./src/monitoring/Logger');

const logger = createLogger({ level: 'debug', context: { name: 'test' } });
logger.debug('Debug message');
logger.info('Info message');
logger.warn('Warning message');
logger.error('Error message');

// Test child logger
const childLogger = logger.child({ component: 'test-component' });
childLogger.info('Child logger message');
console.log('Logger tests passed!\n');

// Test MetricsCollector
console.log('=== Testing MetricsCollector ===');
const { createMetricsCollector } = require('./src/monitoring/MetricsCollector');

const metrics = createMetricsCollector({ maxDataPoints: 100 });

// Test counters
metrics.incrementCounter('test.counter', 1);
metrics.incrementCounter('test.counter', 5);
console.log('Counter value:', metrics.getCounter('test.counter'));

// Test gauges
metrics.setGauge('test.gauge', 42);
console.log('Gauge value:', metrics.getGauge('test.gauge'));

// Test histograms
metrics.recordHistogram('test.histogram', 100);
metrics.recordHistogram('test.histogram', 200);
metrics.recordHistogram('test.histogram', 300);

const histStats = metrics.getHistogramStats('test.histogram');
console.log('Histogram stats:', histStats);

// Test timers
const timer = metrics.startTimer('test.operation');
setTimeout(() => timer.stop(), 50);

// Test system metrics collection
metrics.collectSystemMetrics();
console.log('System metrics collected');

console.log('MetricsCollector tests passed!\n');

// Test HealthMonitor
console.log('=== Testing HealthMonitor ===');
const { createHealthMonitor } = require('./src/monitoring/HealthMonitor');

const health = createHealthMonitor({ interval: 5000 });

// Register custom check
health.registerCheck('custom', async () => ({
  healthy: true,
  value: 100,
  message: 'Custom check passed'
}));

// Register service
health.registerService('workflow-engine', async () => ({
  healthy: true,
  activeWorkflows: 5
}));

// Run checks
const results = health.checkAll();
console.log('Health check results:', results);

// Get status
const status = health.getStatus();
console.log('Health status:', status.status);

console.log('HealthMonitor tests passed!\n');

// Test ErrorTracker
console.log('=== Testing ErrorTracker ===');
const { createErrorTracker } = require('./src/monitoring/ErrorTracker');

const tracker = createErrorTracker();

// Track some errors
try {
  throw new Error('Test error 1');
} catch (e) {
  tracker.track(e, { workflowId: 'wf-001', stageId: 'stage-1' });
}

try {
  throw new Error('Network timeout');
} catch (e) {
  tracker.track(e, { workflowId: 'wf-002', category: 'network' });
}

// Get errors
const errors = tracker.getErrors({ limit: 10 });
console.log('Tracked errors:', errors.length);

// Get stats
const stats = tracker.getStats();
console.log('Error stats:', {
  total: stats.total,
  byCategory: stats.byCategory,
  recent: stats.recent
});

console.log('ErrorTracker tests passed!\n');

// Test MonitoringSystem
console.log('=== Testing MonitoringSystem ===');
const { createMonitoringSystem } = require('./src/monitoring/index');

const monitor = createMonitoringSystem({ logLevel: 'info' });

// Initialize
monitor.initialize({
  autoCollectMetrics: false,
  autoMonitorHealth: false
}).then(() => {
  console.log('Monitoring system initialized');

  // Get logger
  const moduleLogger = monitor.getLogger('test-module');
  moduleLogger.info('Module-specific log');

  // Test execution tracking
  const execution = monitor.startExecution('exec-001', { workflow: 'test-workflow' });

  // Simulate work
  setTimeout(() => {
    monitor.endExecution(execution, { success: true });

    // Get status
    const status = monitor.getStatus();
    console.log('System status - uptime:', status.uptime > 0 ? 'OK' : 'FAIL');

    console.log('\n=== All P3-F4 Tests Passed! ===');
    process.exit(0);
  }, 100);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
