# Getting Started with UI-TARS

## Prerequisites

- Node.js 18+
- npm or yarn
- Git

## Installation

1. Clone the repository:
```bash
git clone https://github.com/your-repo/ui-tars.git
cd ui-tars
```

2. Install dependencies:
```bash
npm install
```

3. Verify the installation:
```bash
./init.sh
```

## Quick Start

### 1. Basic Workflow Execution

Create a simple workflow file:

```json
{
  "version": "1.0.0",
  "name": "hello-world",
  "stages": [
    {
      "id": "browse",
      "name": "Browse Page",
      "actions": [
        {
          "id": "navigate",
          "type": "navigate",
          "params": {
            "url": "https://example.com"
          }
        },
        {
          "id": "screenshot",
          "type": "screenshot",
          "params": {
            "path": "./screenshot.png"
          }
        }
      ]
    }
  ]
}
```

Execute the workflow:

```javascript
const { WorkflowEngine } = require('./src/engine/WorkflowEngine');
const { ConfigManager } = require('./src/config/ConfigManager');

async function main() {
  const config = new ConfigManager();
  await config.load('./config/default.json');

  const engine = new WorkflowEngine(config);
  const result = await engine.execute('./workflows/hello-world.json');

  console.log('Result:', result.success);
}

main();
```

### 2. Using the Command Line

Run a workflow from the command line:

```bash
node run-workflow.js ./workflows/hello-world.json
```

### 3. Browser Automation

```javascript
const { BrowserEnhancer } = require('./src/browser/BrowserEnhancer');

async function main() {
  const browser = new BrowserEnhancer({
    engine: 'puppeteer',
    headless: false
  });

  await browser.launch();
  await browser.navigate('https://google.com');
  await browser.type('textarea[name="q"]', 'UI-TARS');
  await browser.click('input[name="btnK"]');
  await browser.screenshot({ path: './results.png' });
  await browser.close();
}

main();
```

### 4. Generate a Report

```javascript
const { ReportGenerator, PDFConverter } = require('./src/reports');

async function main() {
  const generator = new ReportGenerator({ style: 'professional' });

  generator.addSection({
    heading: 'Introduction',
    content: '<p>Welcome to the report.</p>'
  });

  generator.addChart({
    type: 'bar',
    title: 'Sample Chart',
    data: {
      labels: ['A', 'B', 'C'],
      values: [10, 20, 30]
    }
  });

  const htmlPath = await generator.save('./reports/report.html');

  const pdfConverter = new PDFConverter();
  await pdfConverter.convert(htmlPath, './reports/report.pdf');
}

main();
```

## Project Structure

```
ui-tars/
├── src/
│   ├── engine/          # Workflow engine
│   ├── config/          # Configuration
│   ├── skills/          # Skill system
│   ├── browser/         # Browser automation
│   ├── reports/         # Report generation
│   ├── search/          # Network search
│   ├── office/          # Office documents
│   ├── email/           # Email processing
│   ├── monitoring/      # Monitoring & logging
│   └── utils/           # Utilities
├── workflows/           # Workflow templates
├── skills/              # Skill packages
├── docs/                # Documentation
├── reports/             # Generated reports
└── workspace/          # Working directory
```

## Next Steps

- Read [Writing Workflows](./writing-workflows.md)
- Explore [API Documentation](../api/engine.md)
- Check out [Example Workflows](../../workflows/)
