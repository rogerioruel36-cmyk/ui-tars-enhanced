# UI-TARS API Documentation

## Overview

UI-TARS is a多功能 AI Agent 工作流平台 that extends browser automation with powerful workflow, skill, and reporting capabilities.

## Module Structure

```
src/
├── engine/           # Workflow engine core
├── config/           # Configuration management
├── skills/           # Skill system framework
├── browser/          # Browser automation enhancements
├── reports/          # Report generation (HTML, PDF, PPT)
├── search/           # Network search enhancement
├── office/           # Office document processing (Word, Excel)
├── email/            # Email processing (IMAP, SMTP)
├── monitoring/       # Monitoring and logging
└── utils/            # Performance optimization utilities
```

## Quick Start

```javascript
const { WorkflowEngine } = require('./src/engine/WorkflowEngine');
const { ConfigManager } = require('./src/config/ConfigManager');

async function main() {
  const config = new ConfigManager();
  await config.load('./workflow.config.json');

  const engine = new WorkflowEngine(config);
  const result = await engine.execute('./workflows/example.json');
  console.log('Workflow result:', result);
}

main();
```

## Core Modules

### [Workflow Engine](./api/engine.md)
- **WorkflowEngine**: Execute JSON-based workflow templates
- Version: 1.0.0

### [Config Manager](./api/config.md)
- **ConfigManager**: Load and manage workflow configurations
- Version: 1.0.0

### [Skill System](./api/skills.md)
- **SkillSystem**: Dynamic skill loading and execution
- Version: 1.0.0

## Feature Modules

### [Browser Enhancer](./api/browser.md)
- **BrowserEnhancer**: Enhanced browser automation
  - Smart element positioning
  - Complex form handling
  - File upload/download
  - Screenshot and recording
- Version: 2.0.0

### [Report Generator](./api/reports.md)
- **ReportGenerator**: Multi-style HTML report generation
- **PDFConverter**: HTML to PDF conversion
- **PPTConverter**: HTML to PowerPoint conversion
- Version: 2.0.0

### [Network Searcher](./api/search.md)
- **NetworkSearcher**: Multi-source aggregated search
  - Result caching
  - Smart retry
  - Quality optimization
- Version: 2.0.0

### [Office Processing](./api/office.md)
- **WordProcessor**: Word document read/write (docx)
- **ExcelProcessor**: Excel document read/write (ExcelJS)
- Version: 3.0.0

### [Email Processing](./api/email.md)
- **ImapClient**: IMAP email receiving
- **SmtpClient**: SMTP email sending
- **EmailClassifier**: Auto email classification
- **AutoReply**: AI-powered auto-reply
- Version: 3.0.0

### [Monitoring](./api/monitoring.md)
- **Logger**: Structured logging
- **MetricsCollector**: Performance metrics
- **HealthMonitor**: System health monitoring
- **ErrorTracker**: Error tracking and recovery
- Version: 3.0.0

### [Performance](./api/performance.md)
- **PerformanceOptimizer**: Caching, parallel execution, incremental updates
- Version: 3.0.0

## Action Types

| Action | Description | Parameters |
|--------|-------------|------------|
| `navigate` | Navigate to URL | `url` |
| `click` | Click element | `selector` |
| `type` | Input text | `selector`, `value` |
| `screenshot` | Take screenshot | `path` |
| `wait` | Wait duration | `ms` |
| `evaluate` | Execute JS | `script` |
| `extract` | Extract data | `selector`, `output` |
| `skill` | Execute skill | `skill`, `skillParams` |
| `search` | Network search | `query`, `sources` |
| `http` | HTTP request | `url`, `method`, `body` |
| `file` | File operation | `operation`, `path` |
| `scroll` | Scroll page | `direction`, `amount` |
| `select` | Select option | `selector`, `value` |
| `upload` | Upload file | `selector`, `path` |
| `download` | Download file | `url`, `path` |
| `waitForSelector` | Wait for element | `selector`, `timeout` |
| `loop` | Loop action | `count`, `over`, `until` |
| `condition` | Conditional | `expression` |

## Workflow Schema

See [workflow.schema.json](../workflow.schema.json) for the complete JSON Schema definition.

## Guides

- [Getting Started](./guides/getting-started.md)
- [Writing Workflows](./guides/writing-workflows.md)
- [Creating Custom Skills](./guides/creating-skills.md)
- [Report Customization](./guides/reports.md)

## Examples

See the [workflows/](../workflows/) directory for ready-to-use templates:
- `example.json` - Basic workflow example
- `web-scraper.json` - Web scraping template
- `report-generator.json` - Report generation template
- `email-automation.json` - Email automation template
- `research-assistant.json` - Research workflow template

## License

MIT
