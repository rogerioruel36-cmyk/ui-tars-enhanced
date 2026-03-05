/**
 * Health Monitor
 * Monitors system health and resource usage
 */
const os = require('os');
const EventEmitter = require('events');

class HealthMonitor extends EventEmitter {
  constructor(options = {}) {
    super();
    this.interval = options.interval || 30000; // 30 seconds
    this.thresholds = {
      cpu: options.cpuThreshold || 80,        // 80% CPU
      memory: options.memoryThreshold || 85,  // 85% memory
      disk: options.diskThreshold || 90,       // 90% disk
      ...options.thresholds
    };
    this.checks = new Map();
    this.status = 'healthy';
    this.lastCheck = null;
    this.timer = null;
    this.services = new Map();

    this._registerDefaultChecks();
  }

  _registerDefaultChecks() {
    // CPU check
    this.registerCheck('cpu', async () => {
      const load = os.loadavg();
      const cpuCount = os.cpus().length;
      const loadPercent = (load[0] / cpuCount) * 100;

      return {
        healthy: loadPercent < this.thresholds.cpu,
        value: loadPercent,
        threshold: this.thresholds.cpu,
        message: `CPU load: ${loadPercent.toFixed(1)}%`
      };
    });

    // Memory check
    this.registerCheck('memory', async () => {
      const total = os.totalmem();
      const free = os.freemem();
      const used = total - free;
      const percent = (used / total) * 100;

      return {
        healthy: percent < this.thresholds.memory,
        value: percent,
        threshold: this.thresholds.memory,
        message: `Memory usage: ${percent.toFixed(1)}% (${Math.round(used / 1024 / 1024)}MB / ${Math.round(total / 1024 / 1024)}MB)`
      };
    });

    // Disk check (if available)
    this.registerCheck('disk', async () => {
      // Note: In Node.js, real disk usage requires external tools
      // For now, we'll simulate a check
      return {
        healthy: true,
        value: 0,
        threshold: this.thresholds.disk,
        message: 'Disk check not available in this environment'
      };
    });

    // Event loop lag check
    this.registerCheck('eventLoop', async () => {
      const start = process.hrtime.bigint();
      // Schedule a check
      await new Promise(resolve => setImmediate(resolve));
      const end = process.hrtime.bigint();
      const lagMs = Number(end - start) / 1000000;

      return {
        healthy: lagMs < 50,
        value: lagMs,
        threshold: 50,
        message: `Event loop lag: ${lagMs.toFixed(2)}ms`
      };
    });
  }

  registerCheck(name, checkFn) {
    this.checks.set(name, checkFn);
  }

  unregisterCheck(name) {
    this.checks.delete(name);
  }

  registerService(name, healthFn) {
    this.services.set(name, healthFn);
  }

  unregisterService(name) {
    this.services.delete(name);
  }

  async checkAll() {
    const results = {
      timestamp: new Date().toISOString(),
      overall: 'healthy',
      checks: {},
      services: {}
    };

    // Run system checks
    for (const [name, checkFn] of this.checks) {
      try {
        const result = await checkFn();
        results.checks[name] = result;
        if (!result.healthy) {
          results.overall = 'unhealthy';
        }
      } catch (error) {
        results.checks[name] = {
          healthy: false,
          error: error.message
        };
        results.overall = 'unhealthy';
      }
    }

    // Run service checks
    for (const [name, healthFn] of this.services) {
      try {
        const result = await healthFn();
        results.services[name] = {
          healthy: result !== false,
          ...(typeof result === 'object' ? result : { details: result })
        };
        if (result === false || (result.healthy === false)) {
          results.overall = 'degraded';
        }
      } catch (error) {
        results.services[name] = {
          healthy: false,
          error: error.message
        };
        results.overall = 'degraded';
      }
    }

    // Update status
    const prevStatus = this.status;
    this.status = results.overall;
    this.lastCheck = results;

    // Emit events if status changed
    if (prevStatus !== this.status) {
      this.emit('statusChange', { previous: prevStatus, current: this.status, results });
    }

    if (this.status === 'unhealthy') {
      this.emit('unhealthy', results);
    }

    return results;
  }

  async checkOne(name) {
    const checkFn = this.checks.get(name);
    if (!checkFn) {
      throw new Error(`Check '${name}' not found`);
    }
    return await checkFn();
  }

  getStatus() {
    return {
      status: this.status,
      lastCheck: this.lastCheck ? this.lastCheck.timestamp : null,
      thresholds: this.thresholds
    };
  }

  getHealth() {
    return this.lastCheck || { status: 'unknown', checks: {}, services: {} };
  }

  startMonitoring() {
    this.checkAll();
    this.timer = setInterval(() => this.checkAll(), this.interval);
    this.timer.unref();
  }

  stopMonitoring() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  // Create a simple health check for workflow engine
  static createWorkflowHealthCheck(workflowEngine) {
    return async () => {
      const metrics = workflowEngine.perf?.getMetrics?.();
      return {
        healthy: !metrics?.errors || metrics.errors === 0,
        activeActions: workflowEngine.actions?.size || 0,
        metrics
      };
    };
  }
}

// Singleton instance
let globalMonitor = null;

function createHealthMonitor(options) {
  return new HealthMonitor(options);
}

function getGlobalHealthMonitor() {
  if (!globalMonitor) {
    globalMonitor = new HealthMonitor();
  }
  return globalMonitor;
}

module.exports = { HealthMonitor, createHealthMonitor, getGlobalHealthMonitor };
