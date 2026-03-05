# Browser Enhancer API

## Overview

The Browser Enhancer provides advanced browser automation capabilities including smart element positioning, complex form handling, and file operations.

## Class: BrowserEnhancer

```javascript
const { BrowserEnhancer } = require('./src/browser/BrowserEnhancer');
```

### Constructor

```javascript
new BrowserEnhancer(options?)
```

**Parameters:**
- `options` (Object): Optional configuration
  - `engine` (string): 'puppeteer' or 'playwright'
  - `headless` (boolean): Run in headless mode
  - `viewport` (Object): Viewport configuration
  - `timeout` (number): Default timeout in ms

### Methods

#### launch(options?)

Launch a browser instance.

```javascript
const enhancer = new BrowserEnhancer({ engine: 'puppeteer' });
await enhancer.launch({ headless: false });
```

**Parameters:**
- `options` (Object): Browser launch options

**Returns:** Promise<Browser>

#### navigate(url, options?)

Navigate to a URL.

```javascript
await enhancer.navigate('https://example.com', {
  waitUntil: 'networkidle2',
  timeout: 30000
});
```

#### click(selector, options?)

Click an element with smart positioning.

```javascript
// Simple click
await enhancer.click('#submit-button');

// Click with offset
await enhancer.click('.menu-item', { offsetX: 10, offsetY: 5 });

// Click with retry
await enhancer.click('.dynamic-button', { retry: 3, retryDelay: 1000 });
```

#### type(selector, text, options?)

Type text into an input field.

```javascript
// Simple type
await enhancer.type('#search-input', 'search query');

// Clear and type
await enhancer.type('#input', 'new value', { clear: true });

// Type with delay
await enhancer.type('#username', 'user', { delay: 50 });
```

#### select(selector, value, options?)

Select an option from dropdown.

```javascript
// By value
await enhancer.select('#country-select', 'US');

// By text
await enhancer.select('#city-select', 'New York', { by: 'text' });
```

#### upload(selector, filePath)

Upload a file.

```javascript
await enhancer.upload('#file-input', './uploads/document.pdf');
```

#### download(url, savePath, options?)

Download a file.

```javascript
await enhancer.download('https://example.com/file.pdf', './downloads/file.pdf', {
  timeout: 60000
});
```

#### screenshot(options?)

Take a screenshot.

```javascript
// Viewport screenshot
await enhancer.screenshot({ path: './screenshot.png' });

// Full page screenshot
await enhancer.screenshot({ path: './full-page.png', fullPage: true });
```

#### scroll(direction, amount)

Scroll the page.

```javascript
// Scroll down
await enhancer.scroll('down', 500);

// Scroll to element
await enhancer.scroll('to', '#footer');

// Scroll to top/bottom
await enhancer.scroll('top');
await enhancer.scroll('bottom');
```

#### waitForSelector(selector, options?)

Wait for an element to appear.

```javascript
await enhancer.waitForSelector('#loading-complete', {
  timeout: 10000,
  visible: true
});
```

#### evaluate(script, ...args)

Execute JavaScript in the page context.

```javascript
const title = await enhancer.evaluate(() => document.title);
const elements = await enhancer.evaluate((selector) => {
  return document.querySelectorAll(selector);
}, 'article');
```

#### extract(selector, fields)

Extract data from elements.

```javascript
const data = await enhancer.extract('article', [
  { name: 'title', selector: 'h2' },
  { name: 'content', selector: '.content' },
  { name: 'link', selector: 'a', attribute: 'href' }
]);
```

#### close()

Close the browser.

```javascript
await enhancer.close();
```

### Advanced Features

#### Smart Element Positioning

```javascript
// Find best visible element
const element = await enhancer.findBestElement('.button-group button');

// Handle overlays automatically
await enhancer.click('#modal-button', { handleOverlay: true });
```

#### Form Handling

```javascript
// Fill entire form
await enhancer.fillForm('#registration-form', {
  username: 'johndoe',
  email: 'john@example.com',
  password: 'secret123'
});
```

#### Authentication

```javascript
// Login with credentials
await enhancer.login('https://example.com/login', {
  username: 'user',
  password: 'pass',
  selector: '#username, #password, #login-button'
});
```

## Example: Complete Workflow

```javascript
const { BrowserEnhancer } = require('./src/browser/BrowserEnhancer');

async function main() {
  const enhancer = new BrowserEnhancer({
    engine: 'puppeteer',
    headless: true,
    viewport: { width: 1920, height: 1080 }
  });

  try {
    // Launch browser
    await enhancer.launch();

    // Navigate
    await enhancer.navigate('https://example.com');
    await enhancer.screenshot({ path: './screenshots/home.png' });

    // Interact
    await enhancer.click('#menu');
    await enhancer.type('#search', 'query');
    await enhancer.click('#search-btn');

    // Wait and extract
    await enhancer.waitForSelector('.results');
    const results = await enhancer.extract('.result-item', [
      { name: 'title', selector: 'h3' },
      { name: 'link', selector: 'a', attribute: 'href' }
    ]);

    console.log('Results:', results);

  } finally {
    await enhancer.close();
  }
}

main();
```
