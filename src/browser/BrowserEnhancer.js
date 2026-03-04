/**
 * Browser Operations Enhancement Module
 * Provides smart element location, complex form handling, file upload/download,
 * scroll control, and screenshot/recording capabilities
 */

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('crypto').randomUUID ? () => require('crypto').randomUUID() : () => Date.now().toString(36) + Math.random().toString(36).substr(2);

class BrowserEnhancer {
  constructor(options = {}) {
    this.options = {
      defaultTimeout: options.defaultTimeout || 30000,
      defaultViewport: options.defaultViewport || { width: 1280, height: 720 },
      ...options
    };
    this.recordings = new Map();
  }

  /**
   * Smart Element Location
   * Multiple strategies for finding elements with fallbacks
   */
  async findElement(page, selectors, options = {}) {
    const { timeout = 10000, strategies = ['strict', 'loose', 'text', 'role', 'label'] } = options;
    const selectorList = Array.isArray(selectors) ? selectors : [selectors];

    for (const strategy of strategies) {
      for (const selector of selectorList) {
        try {
          const resolvedSelector = await this.resolveSelector(page, selector, strategy);
          if (resolvedSelector) {
            const element = await page.waitForSelector(resolvedSelector, { timeout: timeout / selectorList.length });
            if (element) {
              return { element, selector: resolvedSelector, strategy };
            }
          }
        } catch (e) {
          // Continue to next strategy
        }
      }
    }
    throw new Error(`Could not find element with selectors: ${selectorList.join(', ')}`);
  }

  async resolveSelector(page, selector, strategy) {
    // Handle @ref format from accessibility tree
    if (selector.startsWith('@')) {
      return `[data-ref="${selector.slice(1)}"]`;
    }

    // Strict selector (CSS or XPath)
    if (strategy === 'strict') {
      try {
        await page.$(selector);
        return selector;
      } catch { return null; }
    }

    // Loose selector - try adding common variations
    if (strategy === 'loose') {
      const variations = [
        selector,
        selector.replace(/\[id="/, '[data-id="'),
        selector.replace(/class="/, '.')
      ];
      for (const v of variations) {
        try {
          const el = await page.$(v);
          if (el) return v;
        } catch { continue; }
      }
    }

    // Text-based selector
    if (strategy === 'text') {
      const text = selector.replace(/['"]/g, '');
      return `text="${text}"`;
    }

    // ARIA role selector
    if (strategy === 'role') {
      const role = selector.startsWith('button') ? 'button' :
                   selector.startsWith('input') ? 'textbox' :
                   selector.startsWith('link') ? 'link' : null;
      if (role) return role;
    }

    // Label-based selector
    if (strategy === 'label') {
      return `label:has-text("${selector}")`;
    }

    return selector;
  }

  /**
   * Complex Form Handling
   * Supports multi-field forms, dynamic forms, validation
   */
  async fillForm(page, fields, options = {}) {
    const { waitForLoad = true, validate = true, submit = false, submitSelector = null } = options;
    const results = {};

    if (waitForLoad) {
      await page.waitForLoadState('domcontentloaded');
    }

    for (const [fieldName, fieldConfig] of Object.entries(fields)) {
      try {
        const result = await this.fillField(page, fieldName, fieldConfig);
        results[fieldName] = result;

        if (validate && fieldConfig.validate !== false) {
          const value = await this.getFieldValue(page, fieldConfig.selector || fieldName);
          if (fieldConfig.expected && value !== fieldConfig.expected) {
            console.warn(`Validation warning for ${fieldName}: expected "${fieldConfig.expected}", got "${value}"`);
          }
        }
      } catch (error) {
        results[fieldName] = { error: error.message };
        if (!fieldConfig.optional) {
          throw error;
        }
      }
    }

    if (submit && submitSelector) {
      await page.click(submitSelector);
      results._submit = { success: true };
    }

    return results;
  }

  async fillField(page, fieldName, config) {
    const { selector, value, action = 'fill', clear = true, delay = 0 } = config;

    // Find the element
    let element;
    if (selector) {
      element = await this.findElement(page, selector);
    } else {
      // Try to find by name, id, or label
      element = await this.findElement(page, [
        `[name="${fieldName}"]`,
        `#${fieldName}`,
        `[id*="${fieldName}"]`,
        `input[aria-label="${fieldName}"]`,
        `label:text("${fieldName}") + input`
      ]);
    }

    // Clear if needed
    if (clear && action !== 'append') {
      await element.element.click({ clickCount: 3 });
      await element.element.press('Backspace');
    }

    // Perform action
    if (action === 'fill' || action === 'append') {
      if (delay > 0) {
        await element.element.type(value, { delay });
      } else {
        await element.element.fill(value);
      }
    } else if (action === 'select') {
      await element.element.selectOption(value);
    } else if (action === 'check') {
      const isChecked = await element.element.isChecked();
      if ((value === true && !isChecked) || (value === false && isChecked)) {
        await element.element.click();
      }
    } else if (action === 'click') {
      await element.element.click();
    }

    return {
      fieldName,
      value,
      selector: element.selector,
      strategy: element.strategy
    };
  }

  async getFieldValue(page, selector) {
    return await page.evaluate(sel => {
      const el = document.querySelector(sel);
      if (!el) return null;
      if (el.tagName === 'INPUT') {
        return el.type === 'checkbox' ? el.checked : el.value;
      }
      if (el.tagName === 'SELECT') {
        return el.value;
      }
      return el.textContent;
    }, selector);
  }

  /**
   * File Upload
   * Handles single and multiple file uploads
   */
  async uploadFile(page, selector, filePaths, options = {}) {
    const { multiple = false, validate = true } = options;

    const files = Array.isArray(filePaths) ? filePaths : [filePaths];

    // Validate files exist
    if (validate) {
      for (const filePath of files) {
        if (!fs.existsSync(filePath)) {
          throw new Error(`File not found: ${filePath}`);
        }
      }
    }

    const element = await page.waitForSelector(selector);
    await element.setInputFiles(files, { multiple });

    return {
      selector,
      files: files.map(f => path.basename(f)),
      count: files.length
    };
  }

  /**
   * File Download
   * Handles file downloads with customizable save location
   */
  async downloadFile(page, triggerSelector, options = {}) {
    const {
      savePath = './downloads',
      filename = null,
      timeout = 30000,
      triggerOptions = {},
      waitForDownload = true
    } = options;

    // Ensure save directory exists
    if (!fs.existsSync(savePath)) {
      fs.mkdirSync(savePath, { recursive: true });
    }

    // Set up download behavior
    const downloadPath = path.join(savePath, filename || `download_${Date.now()}`);

    // Create download promise if waiting for download
    let downloadPromise;
    if (waitForDownload) {
      downloadPromise = new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error(`Download timeout after ${timeout}ms`));
        }, timeout);

        // Listen for download events
        page.on('download', async (download) => {
          clearTimeout(timeoutId);
          const finalPath = filename ? path.join(savePath, filename) : download.suggestedFilename();
          await download.saveAs(finalPath);
          resolve({ path: finalPath, filename: download.suggestedFilename() });
        });
      });
    }

    // Trigger download
    await page.click(triggerSelector, triggerOptions);

    if (waitForDownload) {
      return await downloadPromise;
    } else {
      return { triggered: true, savePath };
    }
  }

  /**
   * Scroll Control
   * Multiple scroll strategies for different scenarios
   */
  async scrollTo(page, target, options = {}) {
    const { behavior = 'smooth', offset = 0 } = options;

    if (typeof target === 'number') {
      await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'smooth' }), target + offset);
      return { type: 'position', y: target + offset };
    }

    if (typeof target === 'string') {
      // Element selector
      const result = await page.evaluate((sel, off, beh) => {
        const el = document.querySelector(sel);
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        return { top: rect.top + window.scrollY + off, behavior: beh };
      }, target, offset, behavior);

      if (!result) {
        throw new Error(`Element not found: ${target}`);
      }

      await page.evaluate((r) => window.scrollTo(r), result);
      return { type: 'element', selector: target, ...result };
    }

    throw new Error('Invalid scroll target: must be number or string');
  }

  async scrollBy(page, options = {}) {
    const { x = 0, y = 0, behavior = 'smooth', viewportPercentage = false } = options;

    if (viewportPercentage) {
      const viewportHeight = page.viewportSize().height;
      await page.evaluate((yPct, beh) => {
        window.scrollBy({ top: window.innerHeight * (yPct / 100), behavior: beh });
      }, y / 100, behavior);
      return { type: 'viewport', x: 0, yPercent: y };
    }

    await page.evaluate((dx, dy, beh) => window.scrollBy({ dx, dy, behavior: 'smooth' }), x, y, behavior);
    return { type: 'pixels', x, y };
  }

  async scrollUntil(page, options = {}) {
    const {
      condition = 'bottom',
      maxScrolls = 20,
      delay = 500,
      scrollAmount = 500,
      elementSelector = null
    } = options;

    let scrolls = 0;
    let reachedEnd = false;

    while (scrolls < maxScrolls) {
      // Check condition
      const isAtEnd = await page.evaluate(() => {
        return window.innerHeight + window.scrollY >= document.body.offsetHeight - 10;
      });

      if (condition === 'bottom' && isAtEnd) {
        reachedEnd = true;
        break;
      }

      if (condition === 'element' && elementSelector) {
        const elementVisible = await page.evaluate(sel => {
          const el = document.querySelector(sel);
          if (!el) return false;
          const rect = el.getBoundingClientRect();
          return rect.top >= 0 && rect.top < window.innerHeight;
        }, elementSelector);

        if (elementVisible) {
          reachedEnd = true;
          break;
        }
      }

      // Scroll
      await page.evaluate((amount) => window.scrollBy(0, amount), scrollAmount);
      await new Promise(r => setTimeout(r, delay));
      scrolls++;
    }

    return { scrolls, reachedEnd, maxScrolls };
  }

  /**
   * Screenshot
   * Multiple screenshot modes including full page, element, and annotated
   */
  async takeScreenshot(page, options = {}) {
    const {
      path: screenshotPath = './screenshots',
      filename = null,
      fullPage = false,
      element = null,
      type = 'png',
      quality = null,
      annotate = null
    } = options;

    // Ensure directory exists
    if (!fs.existsSync(screenshotPath)) {
      fs.mkdirSync(screenshotPath, { recursive: true });
    }

    const finalFilename = filename || `screenshot_${Date.now()}.${type}`;
    const fullPath = path.join(screenshotPath, finalFilename);

    let screenshotOptions = {
      path: fullPath,
      type,
      fullPage
    };

    if (type === 'jpeg' && quality) {
      screenshotOptions.quality = quality;
    }

    // Element screenshot
    if (element) {
      const el = await page.$(element);
      if (!el) {
        throw new Error(`Element not found for screenshot: ${element}`);
      }
      await el.screenshot(screenshotOptions);
    } else {
      await page.screenshot(screenshotOptions);
    }

    // Add annotation if provided
    if (annotate) {
      await this.annotateScreenshot(fullPath, annotate);
    }

    return {
      path: fullPath,
      filename: finalFilename,
      fullPage,
      element: element || null
    };
  }

  async annotateScreenshot(imagePath, annotations) {
    // Simple annotation - in production, use a proper image library
    console.log(`Annotating ${imagePath} with ${annotations.length} annotations`);
    // This is a placeholder - actual implementation would use sharp or canvas
  }

  /**
   * Screen Recording
   * Records browser interactions as video
   */
  async startRecording(page, options = {}) {
    const {
      format = 'webm',
      videoCodec = 'vp9',
      bitsPerSecond = 2500000
    } = options;

    const recordingId = uuidv4();

    // Use CDP to start media recording
    const client = await page.context().newCDPSession(page);
    await client.send('Media.startRecording', {
      mimeType: `video/webm;codecs=${videoCodec}`,
      bitsPerSecond
    });

    this.recordings.set(recordingId, {
      client,
      startTime: Date.now(),
      format
    });

    return { recordingId, status: 'recording' };
  }

  async stopRecording(recordingId) {
    const recording = this.recordings.get(recordingId);
    if (!recording) {
      throw new Error(`Recording not found: ${recordingId}`);
    }

    const { client, startTime } = recording;
    const result = await client.send('Media.stopRecording');

    this.recordings.delete(recordingId);

    return {
      recordingId,
      duration: Date.now() - startTime,
      data: result.data
    };
  }

  /**
   * Wait for element state
   */
  async waitForElementState(page, selector, state, options = {}) {
    const { timeout = 30000 } = options;

    const stateMap = {
      'visible': { state: 'visible' },
      'hidden': { state: 'hidden' },
      'attached': { state: 'attached' },
      'detached': { state: 'detached' }
    };

    const options2 = stateMap[state] || { state: 'visible' };
    await page.waitForSelector(selector, { ...options2, timeout });

    return { selector, state };
  }

  /**
   * Hover and hover-until
   */
  async hover(page, selector, options = {}) {
    const { scrollIntoView = true, delay = 0 } = options;

    const element = await page.waitForSelector(selector);
    if (scrollIntoView) {
      await element.scrollIntoViewIfNeeded();
    }
    await element.hover();

    if (delay > 0) {
      await new Promise(r => setTimeout(r, delay));
    }

    return { selector, hovered: true };
  }

  /**
   * Drag and drop
   */
  async dragAndDrop(page, sourceSelector, targetSelector, options = {}) {
    const { delay = 0 } = options;

    const source = await page.waitForSelector(sourceSelector);
    const target = await page.waitForSelector(targetSelector);

    const sourceBox = await source.boundingBox();
    const targetBox = await target.boundingBox();

    await page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2);
    await page.mouse.down();

    if (delay > 0) {
      await new Promise(r => setTimeout(r, delay));
    }

    await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2, { steps: 10 });
    await page.mouse.up();

    return { source: sourceSelector, target: targetSelector, success: true };
  }

  /**
   * Get element info
   */
  async getElementInfo(page, selector, options = {}) {
    const { attributes = [], text = true, box = true } = options;

    return await page.evaluate((sel, attrs, incText, incBox) => {
      const el = document.querySelector(sel);
      if (!el) return null;

      const result = {};

      if (incText) {
        result.text = el.textContent?.trim();
      }

      if (incBox) {
        const rect = el.getBoundingClientRect();
        result.box = {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
          top: rect.top,
          right: rect.right,
          bottom: rect.bottom,
          left: rect.left
        };
      }

      if (attrs.length > 0) {
        result.attributes = {};
        for (const attr of attrs) {
          result.attributes[attr] = el.getAttribute(attr);
        }
      }

      result.tag = el.tagName.toLowerCase();
      result.visible = el.offsetParent !== null;

      return result;
    }, selector, attributes, text, box);
  }
}

module.exports = BrowserEnhancer;
