/**
 * Workflow Engine Core
 * Implements template parser, executor, and version manager
 */
const fs = require('fs');
const path = require('path');

class WorkflowEngine {
  constructor(options = {}) {
    this.versionManager = new VersionManager();
    this.actions = new Map();
    this.registerDefaultActions();
    this.config = {
      defaultTimeout: options.defaultTimeout || 30000,
      defaultRetry: options.defaultRetry || 3,
      ...options
    };
  }

  registerDefaultActions() {
    // Browser actions
    this.registerAction('navigate', async (params, context) => {
      const { browser, url } = params;
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: 'networkidle0' });
      return { url: page.url(), title: await page.title() };
    });

    this.registerAction('click', async (params, context) => {
      const { page, selector } = params;
      await page.click(selector);
      return { success: true, selector };
    });

    this.registerAction('type', async (params, context) => {
      const { page, selector, text, clear = false } = params;
      if (clear) await page.click(selector, { clickCount: 3 });
      await page.type(selector, text);
      return { success: true, selector, text };
    });

    this.registerAction('screenshot', async (params, context) => {
      const { page, path: screenshotPath, fullPage = false } = params;
      await page.screenshot({ path: screenshotPath, fullPage });
      return { success: true, path: screenshotPath };
    });

    this.registerAction('wait', async (params, context) => {
      const { duration } = params;
      await new Promise(r => setTimeout(r, duration));
      return { waited: duration };
    });

    this.registerAction('evaluate', async (params, context) => {
      const { page, script } = params;
      return await page.evaluate(script);
    });

    this.registerAction('extract', async (params, context) => {
      const { page, selector, attribute = 'textContent' } = params;
      const elements = await page.$$(selector);
      const results = await Promise.all(
        elements.map(el => el.evaluate((el, attr) =>
          attr === 'textContent' ? el.textContent : el.getAttribute(attr), attribute))
      );
      return results.length === 1 ? results[0] : results;
    });

    this.registerAction('waitForSelector', async (params, context) => {
      const { page, selector, timeout = 30000 } = params;
      await page.waitForSelector(selector, { timeout });
      return { success: true, selector };
    });

    this.registerAction('scroll', async (params, context) => {
      const { page, x = 0, y = 0 } = params;
      await page.evaluate((_x, _y) => window.scrollTo(_x, _y), x, y);
      return { success: true, x, y };
    });

    // HTTP action
    this.registerAction('http', async (params, context) => {
      const { method = 'GET', url, headers = {}, body } = params;
      const fetchModule = require('node-fetch') || global.fetch;
      const response = await fetchModule(url, { method, headers, body: body ? JSON.stringify(body) : undefined });
      const contentType = response.headers.get('content-type');
      let data;
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }
      return { status: response.status, data };
    });

    // Skill invocation action
    this.registerAction('skill', async (params, context) => {
      const { skill, skillParams = {} } = params;
      const skillHandler = context.skills?.[skill];
      if (!skillHandler) {
        throw new Error(`Skill '${skill}' not found`);
      }
      return await skillHandler(skillParams, context);
    });

    // Condition action
    this.registerAction('condition', async (params, context) => {
      const { expression, trueActions, falseActions } = params;
      const result = eval(expression); // eslint-disable-line no-eval
      return { result, branch: result ? 'true' : 'false' };
    });

    // Loop action
    this.registerAction('loop', async (params, context) => {
      const { count, variable, until, delay = 0, actions } = params;
      const results = [];
      for (let i = 0; i < count; i++) {
        if (until && eval(until)) break; // eslint-disable-line no-eval
        context.variables[variable] = i;
        const stageResult = await this.executeStage({ actions }, context);
        results.push(stageResult);
        if (delay) await new Promise(r => setTimeout(r, delay));
      }
      return { iterations: results.length, results };
    });
  }

  registerAction(name, handler) {
    this.actions.set(name, handler);
  }

  async loadTemplate(templatePath) {
    const content = fs.readFileSync(templatePath, 'utf8');
    const template = JSON.parse(content);
    return this.parseTemplate(template);
  }

  parseTemplate(template) {
    // Validate version
    this.versionManager.validate(template.version);

    // Check required fields
    if (!template.name || !template.stages) {
      throw new Error('Invalid template: missing required fields');
    }

    return template;
  }

  async execute(template, context = {}) {
    const parsed = this.parseTemplate(template);
    const executionContext = {
      variables: { ...parsed.variables, ...context.variables },
      browser: context.browser,
      page: context.page,
      results: {},
      skills: context.skills || {},
      errors: []
    };

    const config = parsed.config || {};

    try {
      // Execute stages in order
      for (const stage of parsed.stages) {
        if (!this.shouldExecute(stage, executionContext)) continue;

        try {
          const stageResult = await this.executeStage(stage, executionContext);
          executionContext.results[stage.id] = stageResult;

          if (stage.onSuccess?.action === 'stop') break;
        } catch (stageError) {
          executionContext.errors.push({ stage: stage.id, error: stageError.message });

          if (!config.continueOnError) {
            throw stageError;
          }

          if (stage.onError?.action === 'stop') break;
          if (stage.onError?.action === 'retry') {
            // Retry logic handled in executeAction
          }
        }
      }

      return { success: true, results: executionContext.results, errors: executionContext.errors };
    } catch (error) {
      return { success: false, error: error.message, results: executionContext.results, errors: executionContext.errors };
    }
  }

  shouldExecute(stage, context) {
    if (stage.enabled === false) return false;
    if (stage.condition) {
      try {
        return eval(stage.condition); // eslint-disable-line no-eval
      } catch {
        return false;
      }
    }
    return true;
  }

  async executeStage(stage, context) {
    const results = {};

    for (const action of stage.actions) {
      if (!this.shouldExecuteAction(action, context)) continue;

      try {
        const result = await this.executeAction(action, context);
        results[action.id] = result;

        if (action.output) {
          context.variables[action.output] = result;
        }

        if (action.onSuccess?.action === 'stop') break;
        if (action.onSuccess?.action === 'skip') {
          // Skip remaining actions in stage
          break;
        }
      } catch (error) {
        results[action.id] = { error: error.message };

        if (action.onError?.action === 'stop') throw error;
        if (action.onError?.action === 'skip') break;
        if (action.onError?.action === 'retry' && action.retry) {
          // Retry logic
          for (let i = 0; i < action.retry; i++) {
            try {
              const result = await this.executeAction(action, context);
              results[action.id] = result;
              break;
            } catch (retryError) {
              if (i === action.retry - 1) throw retryError;
            }
          }
        }
      }
    }

    return results;
  }

  shouldExecuteAction(action, context) {
    if (action.enabled === false) return false;
    if (action.condition) {
      try {
        return eval(action.condition); // eslint-disable-line no-eval
      } catch {
        return false;
      }
    }
    return true;
  }

  async executeAction(action, context) {
    const handler = this.actions.get(action.type);
    if (!handler) {
      throw new Error(`Unknown action type: ${action.type}`);
    }

    // Merge context with action params
    const params = {
      ...action.params,
      ...(action.selector && { selector: action.selector }),
      browser: context.browser,
      page: context.page,
      variables: context.variables
    };

    const timeout = action.timeout || this.config.defaultTimeout;
    const retry = action.retry !== undefined ? action.retry : this.config.defaultRetry;

    let lastError;
    for (let attempt = 0; attempt <= retry; attempt++) {
      try {
        return await this.executeWithTimeout(handler, params, context, timeout);
      } catch (error) {
        lastError = error;
        if (attempt < retry) {
          await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
        }
      }
    }

    throw lastError;
  }

  async executeWithTimeout(handler, params, context, timeout) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(`Action timeout after ${timeout}ms`)), timeout);
      Promise.resolve(handler(params, context))
        .then(result => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch(err => {
          clearTimeout(timer);
          reject(err);
        });
    });
  }
}

class VersionManager {
  constructor() {
    this.supportedVersions = ['1.0.0', '1.0.1', '1.1.0', '2.0.0'];
  }

  validate(version) {
    if (!version) {
      throw new Error('Template version is required');
    }
    // For now, accept any semver format
    const semverRegex = /^\d+\.\d+\.\d+$/;
    if (!semverRegex.test(version)) {
      throw new Error(`Invalid version format: ${version}. Expected semver (e.g., 1.0.0)`);
    }
    return true;
  }

  isCompatible(version) {
    return this.supportedVersions.some(v => version.startsWith(v.split('.').slice(0, 2).join('.')));
  }

  compare(v1, v2) {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);
    for (let i = 0; i < 3; i++) {
      if (parts1[i] > parts2[i]) return 1;
      if (parts1[i] < parts2[i]) return -1;
    }
    return 0;
  }
}

module.exports = { WorkflowEngine, VersionManager };
