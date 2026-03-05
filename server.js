/**
 * UI-TARS Server
 * Serves the Enhanced Features UI and provides API endpoints for report generation
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

// Serve the main UI
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'ui.html'));
});

// Get available workflow templates
app.get('/api/workflows', (req, res) => {
  const workflowsDir = path.join(__dirname, 'workflows');
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

// Get run logs
app.get('/api/logs', (req, res) => {
  res.json({ logs: runLogs, status: runStatus });
});

// Generate report API
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

      const htmlPath = path.join(__dirname, 'reports', `${title || 'report'}-${style || 'style'}.html`);
      fs.writeFileSync(htmlPath, html);
      addLog(`HTML saved to: ${htmlPath}`, 'success');
      results.html = htmlPath;
    }

    // Generate PDF
    if (outputs.includes('pdf')) {
      addLog('Converting to PDF...');
      const pdfConverter = new PDFConverter();

      const pdfHtml = outputs.includes('html')
        ? fs.readFileSync(results.html, 'utf-8')
        : new ReportGenerator().generate({
            title: title || 'Research Report',
            style: style || 'finance',
            sections: reportSections
          });

      const pdfPath = path.join(__dirname, 'reports/pdf', `${title || 'report'}-${style || 'style'}.pdf`);
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

      const pptPath = path.join(__dirname, 'reports/ppt', `${title || 'report'}-${style || 'style'}.pptx`);
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

// Start server
app.listen(PORT, () => {
  console.log(`\n========================================`);
  console.log(`  UI-TARS Enhanced Features Server`);
  console.log(`========================================`);
  console.log(`  Server running at: http://localhost:${PORT}`);
  console.log(`  Open in browser to access the UI`);
  console.log(`========================================\n`);
});
