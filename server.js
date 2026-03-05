/**
 * UI-TARS Server
 * Serves the Enhanced Features UI and provides API endpoints for report generation,
 * email management, and browser control
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Import report generation modules
const ReportGenerator = require('./src/reports/ReportGenerator');
const PDFConverter = require('./src/reports/PDFConverter');
const PPTConverter = require('./src/reports/PPTConverter');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory log storage for the UI
let runLogs = [];
let runStatus = 'idle';

// Email module state (P3-F2)
let emailConfig = {
  host: '',
  port: 993,
  user: '',
  password: '',
  secured: false
};

let emailInbox = [];
let emailSent = [];

// Browser module state (P2-F4)
let browserState = {
  currentUrl: '',
  lastScreenshot: null,
  isConnected: false
};

// Serve the main UI
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'ui.html'));
});

// ==================== Health Check API ====================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    modules: {
      agentConsole: { status: 'available', url: 'http://localhost:7777' },
      reportCenter: { status: 'ready', version: '1.0.0' },
      emailModule: { status: emailConfig.host ? 'configured' : 'unconfigured' },
      browserModule: { status: browserState.isConnected ? 'connected' : 'disconnected' }
    },
    timestamp: new Date().toISOString()
  });
});

// ==================== Workflow API ====================

app.get('/api/workflows', (req, res) => {
  const workflowsDir = path.join(__dirname, 'workflows');
  if (!fs.existsSync(workflowsDir)) {
    return res.json([]);
  }
  const files = fs.readdirSync(workflowsDir).filter(f => f.endsWith('.json'));
  const workflows = files.map(f => {
    const content = fs.readFileSync(path.join(workflowsDir, f), 'utf-8');
    const data = JSON.parse(content);
    return {
      id: f.replace('.json', ''),
      name: data.name,
      description: data.description,
      tags: data.metadata?.tags || []
    };
  });
  res.json(workflows);
});

// ==================== Logs API ====================

app.get('/api/logs', (req, res) => {
  res.json({ logs: runLogs, status: runStatus });
});

app.post('/api/logs/clear', (req, res) => {
  runLogs = [];
  if (runStatus !== 'running') runStatus = 'idle';
  res.json({ success: true });
});

// ==================== Report Generation API ====================

app.post('/api/generate', async (req, res) => {
  const { title, style, outputs, sections, workflow } = req.body;

  runLogs = [];
  runStatus = 'running';

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toISOString();
    runLogs.push({ timestamp, message, type });
    console.log(`[${type.toUpperCase()}] ${message}`);
  };

  try {
    addLog('Starting report generation...');
    addLog(`Title: ${title}`);
    addLog(`Style: ${style}`);
    addLog(`Requested outputs: ${outputs.join(', ')}`);

    // Generate sample data based on sections provided
    const reportSections = sections && sections.length > 0 ? sections : [
      {
        heading: 'Executive Summary',
        content: 'This is a comprehensive report generated through the UI-TARS Enhanced Features panel. The report demonstrates the integrated report generation capabilities across multiple output formats.'
      },
      {
        heading: 'Key Findings',
        content: '• Report generation system is fully functional\n• Multiple visual styles available (sports, entertainment, finance, politics, military)\n• HTML, PDF, and PPT output formats supported\n• Workflow templates can be selected and executed',
        stats: [
          { label: 'Reports Generated', value: '1,000+' },
          { label: 'Success Rate', value: '99.9%' },
          { label: 'Avg. Generation Time', value: '2.5s' }
        ]
      },
      {
        heading: 'Analysis',
        content: 'The system successfully integrates all available modules for a seamless reporting experience. Users can select their preferred visual style and output format through an intuitive interface.'
      },
      {
        heading: 'Recommendations',
        content: '1. Use the workflow template selector for automated report generation\n2. Choose appropriate visual style based on report audience\n3. Enable multiple output formats for comprehensive coverage'
      }
    ];

    const results = {};

    // Generate HTML
    if (outputs.includes('html')) {
      addLog('Generating HTML report...');
      const generator = new ReportGenerator();
      const html = generator.generate({
        title: title || 'Research Report',
        style: style || 'finance',
        sections: reportSections,
        metadata: {
          author: 'UI-TARS',
          date: new Date().toISOString(),
          tags: ['generated', 'ui-tars']
        }
      });

      const safeTitle = (title || 'report').replace(/[^a-zA-Z0-9-_]/g, '-');
      const safeStyle = (style || 'style').replace(/[^a-zA-Z0-9-_]/g, '-');
      const htmlPath = path.join(__dirname, 'reports', `${safeTitle}-${safeStyle}.html`);
      fs.writeFileSync(htmlPath, html);
      addLog(`HTML saved to: ${htmlPath}`, 'success');
      results.html = htmlPath;
    }

    // Generate PDF
    if (outputs.includes('pdf')) {
      addLog('Converting to PDF...');
      const pdfConverter = new PDFConverter();

      const pdfHtml = outputs.includes('html') && results.html
        ? fs.readFileSync(results.html, 'utf-8')
        : new ReportGenerator().generate({
            title: title || 'Research Report',
            style: style || 'finance',
            sections: reportSections
          });

      const pdfDir = path.join(__dirname, 'reports/pdf');
      if (!fs.existsSync(pdfDir)) {
        fs.mkdirSync(pdfDir, { recursive: true });
      }

      const safeTitle = (title || 'report').replace(/[^a-zA-Z0-9-_]/g, '-');
      const safeStyle = (style || 'style').replace(/[^a-zA-Z0-9-_]/g, '-');
      const pdfPath = path.join(pdfDir, `${safeTitle}-${safeStyle}.pdf`);
      await pdfConverter.fromHTML(pdfHtml, pdfPath);
      addLog(`PDF saved to: ${pdfPath}`, 'success');
      results.pdf = pdfPath;
    }

    // Generate PPT
    if (outputs.includes('ppt')) {
      addLog('Converting to PowerPoint...');
      const pptConverter = PPTConverter.create({ theme: style || 'finance', title: title || 'Research Report' });

      const pptData = {
        slides: reportSections.map(s => ({
          type: 'content',
          title: s.heading,
          content: typeof s.content === 'string' ? s.content.split('\n').filter(Boolean) : [s.content]
        }))
      };

      const pptDir = path.join(__dirname, 'reports/ppt');
      if (!fs.existsSync(pptDir)) {
        fs.mkdirSync(pptDir, { recursive: true });
      }

      const safeTitle = (title || 'report').replace(/[^a-zA-Z0-9-_]/g, '-');
      const safeStyle = (style || 'style').replace(/[^a-zA-Z0-9-_]/g, '-');
      const pptPath = path.join(pptDir, `${safeTitle}-${safeStyle}.pptx`);
      await pptConverter.fromData(pptData, pptPath);
      pptConverter.close();
      addLog(`PPT saved to: ${pptPath}`, 'success');
      results.ppt = pptPath;
    }

    addLog('Report generation completed!', 'success');
    runStatus = 'completed';

    res.json({
      success: true,
      results,
      logs: runLogs
    });

  } catch (error) {
    addLog(`Error: ${error.message}`, 'error');
    runStatus = 'error';
    res.status(500).json({
      success: false,
      error: error.message,
      logs: runLogs
    });
  }
});

// ==================== Email Module API (P3-F2) ====================

// Get email configuration
app.get('/api/email/config', (req, res) => {
  res.json({
    configured: !!emailConfig.host,
    host: emailConfig.host ? emailConfig.host : '',
    port: emailConfig.port,
    user: emailConfig.user ? emailConfig.user : '',
    secured: emailConfig.secured
  });
});

// Set email configuration
app.post('/api/email/config', (req, res) => {
  const { host, port, user, password, secured } = req.body;
  emailConfig = {
    host: host || '',
    port: port || 993,
    user: user || '',
    password: password || '',
    secured: secured || false
  };
  res.json({ success: true, message: 'Email configuration updated' });
});

// Get inbox messages (placeholder)
app.get('/api/email/inbox', (req, res) => {
  // Return sample inbox data for demo
  if (emailInbox.length === 0) {
    emailInbox = [
      { id: 1, from: 'sender@example.com', subject: 'Welcome to UI-TARS', date: new Date().toISOString(), read: false },
      { id: 2, from: 'news@daily.com', subject: 'Daily News Digest', date: new Date(Date.now() - 86400000).toISOString(), read: true }
    ];
  }
  res.json({ messages: emailInbox, total: emailInbox.length });
});

// Send email (placeholder)
app.post('/api/email/send', (req, res) => {
  const { to, subject, body, attachments } = req.body;

  // Simulate sending
  const newEmail = {
    id: Date.now(),
    to,
    subject,
    body,
    date: new Date().toISOString(),
    status: 'sent'
  };
  emailSent.push(newEmail);

  res.json({
    success: true,
    message: 'Email queued for sending',
    email: newEmail
  });
});

// Reply to email (placeholder)
app.post('/api/email/reply', (req, res) => {
  const { messageId, body } = req.body;

  const original = emailInbox.find(m => m.id === messageId);
  if (!original) {
    return res.status(404).json({ success: false, error: 'Message not found' });
  }

  const reply = {
    id: Date.now(),
    to: original.from,
    subject: `Re: ${original.subject}`,
    body,
    date: new Date().toISOString(),
    status: 'sent'
  };
  emailSent.push(reply);

  res.json({
    success: true,
    message: 'Reply sent',
    email: reply
  });
});

// ==================== Browser Module API (P2-F4) ====================

// Get browser state
app.get('/api/browser/state', (req, res) => {
  res.json(browserState);
});

// Open URL (placeholder)
app.post('/api/browser/open', (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ success: false, error: 'URL is required' });
  }

  browserState.currentUrl = url;
  browserState.isConnected = true;

  res.json({
    success: true,
    message: `Browser navigation to ${url} initiated`,
    url: url
  });
});

// Click element (placeholder)
app.post('/api/browser/click', (req, res) => {
  const { selector, x, y } = req.body;

  res.json({
    success: true,
    message: selector ? `Click on "${selector}" initiated` : `Click at (${x}, ${y}) initiated`,
    action: 'click',
    target: selector || { x, y }
  });
});

// Fill form field (placeholder)
app.post('/api/browser/fill', (req, res) => {
  const { selector, value } = req.body;

  if (!selector || value === undefined) {
    return res.status(400).json({ success: false, error: 'Selector and value are required' });
  }

  res.json({
    success: true,
    message: `Fill "${selector}" with value`,
    action: 'fill',
    selector,
    value
  });
});

// Scroll (placeholder)
app.post('/api/browser/scroll', (req, res) => {
  const { x, y, direction } = req.body;

  res.json({
    success: true,
    message: direction ? `Scroll ${direction}` : `Scroll to (${x}, ${y})`,
    action: 'scroll',
    params: { x, y, direction }
  });
});

// Take screenshot (placeholder)
app.post('/api/browser/screenshot', (req, res) => {
  const { fullPage } = req.body;

  const timestamp = Date.now();
  browserState.lastScreenshot = `/screenshots/screenshot-${timestamp}.png`;

  res.json({
    success: true,
    message: fullPage ? 'Full page screenshot captured' : 'Screenshot captured',
    screenshot: browserState.lastScreenshot,
    timestamp
  });
});

// Close browser (placeholder)
app.post('/api/browser/close', (req, res) => {
  browserState.isConnected = false;
  browserState.currentUrl = '';

  res.json({
    success: true,
    message: 'Browser session closed'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n========================================`);
  console.log(`  UI-TARS Unified Dashboard`);
  console.log(`========================================`);
  console.log(`  Server running at: http://localhost:${PORT}`);
  console.log(`  Open in browser to access the dashboard`);
  console.log(`  Agent Console:     http://localhost:7777`);
  console.log(`========================================\n`);
});
