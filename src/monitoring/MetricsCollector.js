/**
 * Metrics Collector
 * Collects and aggregates performance metrics
 */
const os = require('os');

class MetricsCollector {
  constructor(options = {}) {
    this.interval = options.interval || 60000; // 1 minute default
    this.maxDataPoints = options.maxDataPoints || 1000;
    this.metrics = {
      counters: new Map(),
      gauges: new Map(),
      histograms: new Map(),
      timers: new Map()
    };
    this.timeSeries = new Map();
    this.startTime = Date.now();
    this.timer = null;
  }

  // Counter: incrementing value
  incrementCounter(name, value = 1, tags = {}) {
    const key = this._makeKey(name, tags);
    const current = this.metrics.counters.get(key) || 0;
    this.metrics.counters.set(key, current + value);
    this._recordTimeSeries(key, current + value);
  }

  // Gauge: current value
  setGauge(name, value, tags = {}) {
    const key = this._makeKey(name, tags);
    this.metrics.gauges.set(key, value);
    this._recordTimeSeries(key, value);
  }

  // Histogram: statistical distribution
  recordHistogram(name, value, tags = {}) {
    const key = this._makeKey(name, tags);
    let histogram = this.metrics.histograms.get(key);
    if (!histogram) {
      histogram = { values: [], min: Infinity, max: -Infinity, sum: 0, count: 0 };
      this.metrics.histograms.set(key, histogram);
    }

    histogram.values.push(value);
    histogram.min = Math.min(histogram.min, value);
    histogram.max = Math.max(histogram.max, value);
    histogram.sum += value;
    histogram.count++;

    // Keep only last maxDataPoints
    if (histogram.values.length > this.maxDataPoints) {
      histogram.values.shift();
    }

    this._recordTimeSeries(key, value);
  }

  // Timer: measure duration
  startTimer(name, tags = {}) {
    return {
      name,
      tags,
      start: Date.now(),
      end: null,
      stop: () => {
        const end = Date.now();
        this.recordTimer(name, end - this.startTime, tags);
      }
    };
  }

  recordTimer(name, duration, tags = {}) {
    this.recordHistogram(`${name}.duration`, duration, tags);
    this.recordHistogram(`${name}.ms`, duration, tags);
  }

  _makeKey(name, tags) {
    if (!tags || Object.keys(tags).length === 0) return name;
    const tagStr = Object.entries(tags).map(([k, v]) => `${k}:${v}`).join(',');
    return `${name}{${tagStr}}`;
  }

  _recordTimeSeries(key, value) {
    if (!this.timeSeries.has(key)) {
      this.timeSeries.set(key, []);
    }
    const series = this.timeSeries.get(key);
    series.push({ timestamp: Date.now(), value });

    // Keep only last maxDataPoints
    if (series.length > this.maxDataPoints) {
      series.shift();
    }
  }

  // Get counter value
  getCounter(name, tags = {}) {
    const key = this._makeKey(name, tags);
    return this.metrics.counters.get(key) || 0;
  }

  // Get gauge value
  getGauge(name, tags = {}) {
    const key = this._makeKey(name, tags);
    return this.metrics.gauges.get(key);
  }

  // Get histogram statistics
  getHistogramStats(name, tags = {}) {
    const key = this._makeKey(name, tags);
    const histogram = this.metrics.histograms.get(key);
    if (!histogram || histogram.count === 0) return null;

    const values = [...histogram.values].sort((a, b) => a - b);
    const count = values.length;
    const p50 = values[Math.floor(count * 0.5)];
    const p90 = values[Math.floor(count * 0.9)];
    const p95 = values[Math.floor(count * 0.95)];
    const p99 = values[Math.floor(count * 0.99)];

    return {
      count: histogram.count,
      min: histogram.min,
      max: histogram.max,
      mean: histogram.sum / histogram.count,
      sum: histogram.sum,
      p50, p90, p95, p99
    };
  }

  // Get time series data
  getTimeSeries(name, tags = {}, timeRange = null) {
    const key = this._makeKey(name, tags);
    let series = this.timeSeries.get(key) || [];

    if (timeRange) {
      const cutoff = Date.now() - timeRange;
      series = series.filter(p => p.timestamp >= cutoff);
    }

    return series;
  }

  // Get all metrics snapshot
  getSnapshot() {
    return {
      uptime: Date.now() - this.startTime,
      timestamp: new Date().toISOString(),
      counters: Object.fromEntries(this.metrics.counters),
      gauges: Object.fromEntries(this.metrics.gauges),
      histograms: Object.fromEntries(
        Array.from(this.metrics.histograms.entries()).map(([k, v]) => [k, this.getHistogramStats(k.split('{')[0])])
      )
    };
  }

  // Collect system metrics
  collectSystemMetrics() {
    const cpuLoad = os.loadavg();
    const memUsage = process.memoryUsage();
    const memTotal = os.totalmem();
    const freeMem = os.freemem();

    this.setGauge('system.cpu.1m', cpuLoad[0]);
    this.setGauge('system.cpu.5m', cpuLoad[1]);
    this.setGauge('system.cpu.15m', cpuLoad[2]);

    this.setGauge('system.memory.used', memTotal - freeMem);
    this.setGauge('system.memory.free', freeMem);
    this.setGauge('system.memory.total', memTotal);
    this.setGauge('system.memory.percent', ((memTotal - freeMem) / memTotal) * 100);

    this.setGauge('process.memory.heapUsed', memUsage.heapUsed);
    this.setGauge('process.memory.heapTotal', memUsage.heapTotal);
    this.setGauge('process.memory.rss', memUsage.rss);
    this.setGauge('process.memory.external', memUsage.external);

    // CPU usage
    const cpuUsage = process.cpuUsage();
    this.setGauge('process.cpu.user', cpuUsage.user);
    this.setGauge('process.cpu.system', cpuUsage.system);
  }

  // Start automatic collection
  startAutoCollect() {
    this.collectSystemMetrics();
    this.timer = setInterval(() => this.collectSystemMetrics(), this.interval);
    this.timer.unref();
  }

  // Stop automatic collection
  stopAutoCollect() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  // Reset all metrics
  reset() {
    this.metrics.counters.clear();
    this.metrics.gauges.clear();
    this.metrics.histograms.clear();
    this.timeSeries.clear();
    this.startTime = Date.now();
  }
}

// Singleton instance
let globalCollector = null;

function createMetricsCollector(options) {
  return new MetricsCollector(options);
}

function getGlobalMetricsCollector() {
  if (!globalCollector) {
    globalCollector = new MetricsCollector();
  }
  return globalCollector;
}

module.exports = { MetricsCollector, createMetricsCollector, getGlobalMetricsCollector };
