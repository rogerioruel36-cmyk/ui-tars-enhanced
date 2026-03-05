/**
 * Monitoring & Logging System
 * Provides comprehensive monitoring, logging, metrics, and error tracking
 */
const { Logger, FileHandler, createLogger, createFileLogger } = require('./Logger');
const { MetricsCollector, createMetricsCollector, getGlobalMetricsCollector } = require('./MetricsCollector');
const { HealthMonitor, createHealthMonitor, getGlobalHealthMonitor } = require('./HealthMonitor');
const { ErrorTracker, createErrorTracker, getGlobalErrorTracker } = require('./ErrorTracker');

class MonitoringSystem {
  constructor(options = {}) {
    this.options = options;
    this.logger = options.logger || createLogger({
      level: options.logLevel || 'info',
      context: { name: 'ui-tars' }
    });

    this.metrics = options.metrics || createMetricsCollector();
    this.health = options.health || createHealthMonitor();
    this.errors = options.errors || createErrorTracker();

    this.initialized = false;
    this.startTime = Date.now();
  }

  async initialize(config = {}) {
    // Setup file logging if configured
    if (config.logFile) {
      this.logger.addHandler(new FileHandler(config.logFile, config.fileOptions));
    }

    // Start metrics auto-collection
    if (config.autoCollectMetrics !== false) {
      this.metrics.startAutoCollect();
    }

    // Start health monitoring
    if (config.autoMonitorHealth !== false) {
      this.health.startMonitoring();
    }

    this.initialized = true;
    this.logger.info('Monitoring system initialized', config);

    return this;
  }

  /**
   * Create a logger for a specific module
   */
  getLogger(name) {
    return this.logger.child({ module: name });
  }

  /**
   * Start tracking execution
   */
  startExecution(executionId, metadata = {}) {
    const timer = this.metrics.startTimer('execution', { id: executionId });
    this.logger.info(`Starting execution: ${executionId}`, metadata);
    this.metrics.incrementCounter('executions.started', 1, { id: executionId });

    return {
      executionId,
      timer,
      metadata,
      startTime: Date.now()
    };
  }

  /**
   * End tracking execution
   */
  endExecution(execution, result = {}) {
    const duration = Date.now() - execution.startTime;
    execution.timer.stop();

    if (result.success) {
      this.metrics.incrementCounter('executions.completed', 1, { id: execution.executionId });
    } else {
      this.metrics.incrementCounter('executions.failed', 1, { id: execution.executionId });
      if (result.error) {
        this.errors.track(result.error, {
          executionId: execution.executionId,
          ...execution.metadata
        });
      }
    }

    this.metrics.recordTimer('execution.duration', duration, {
      id: execution.executionId,
      success: result.success ? 'true' : 'false'
    });

    this.logger.info(`Execution completed: ${execution.executionId}`, {
      duration,
      success: result.success,
      ...result
    });

    return { duration, success: result.success };
  }

  /**
   * Track workflow execution
   */
  trackWorkflow(workflowId, stage, action = null) {
    const timer = this.metrics.startTimer('workflow', { workflowId, stage, action: action || 'all' });

    this.metrics.incrementCounter('workflow.started', 1, { workflowId });

    return {
      workflowId,
      stage,
      action,
      timer,
      startTime: Date.now()
    };
  }

  endWorkflowTracking(tracking, result = {}) {
    if (tracking.timer) {
      tracking.timer.stop();
    }

    if (result.error) {
      this.errors.track(result.error, {
        workflowId: tracking.workflowId,
        stage: tracking.stage,
        action: tracking.action
      });
    }
  }

  /**
   * Get system status
   */
  getStatus() {
    return {
      uptime: Date.now() - this.startTime,
      initialized: this.initialized,
      health: this.health.getStatus(),
      metrics: this.metrics.getSnapshot(),
      errors: this.errors.getStats()
    };
  }

  /**
   * Get health report
   */
  async getHealthReport() {
    return await this.health.checkAll();
  }

  /**
   * Shutdown monitoring system
   */
  async shutdown() {
    this.logger.info('Shutting down monitoring system');

    this.metrics.stopAutoCollect();
    this.health.stopMonitoring();

    if (this.options.saveErrorsOnShutdown) {
      const fs = require('fs');
      const errorFile = this.options.errorLogPath || 'workspace/logs/errors.json';
      this.errors.saveToFile(errorFile);
    }

    this.initialized = false;
    return this.getStatus();
  }
}

// Factory function
function createMonitoringSystem(options) {
  return new MonitoringSystem(options);
}

// Default instance
let defaultInstance = null;

function getMonitoringSystem(options) {
  if (!defaultInstance) {
    defaultInstance = new MonitoringSystem(options);
  }
  return defaultInstance;
}

module.exports = {
  MonitoringSystem,
  createMonitoringSystem,
  getMonitoringSystem,
  Logger,
  createLogger,
  createFileLogger,
  MetricsCollector,
  createMetricsCollector,
  getGlobalMetricsCollector,
  HealthMonitor,
  createHealthMonitor,
  getGlobalHealthMonitor,
  ErrorTracker,
  createErrorTracker,
  getGlobalErrorTracker
};
