# Report Generator API

## Overview

The Report Generator creates professional HTML reports in multiple visual styles, with PDF and PPT export capabilities.

## Class: ReportGenerator

```javascript
const { ReportGenerator } = require('./src/reports/ReportGenerator');
```

### Constructor

```javascript
new ReportGenerator(options?)
```

**Parameters:**
- `options` (Object): Optional configuration
  - `style` (string): Report style (sports, entertainment, finance, politics, military, custom)
  - `template` (string): Custom template path
  - `outputDir` (string): Output directory for reports

### Methods

#### generate(data, options?)

Generate an HTML report.

```javascript
const generator = new ReportGenerator({ style: 'finance' });

await generator.generate({
  title: 'Quarterly Report',
  sections: [
    {
      heading: 'Overview',
      content: 'Report content here...'
    }
  ]
}, { outputPath: './reports/report.html' });
```

**Parameters:**
- `data` (Object): Report data
- `options` (Object): Generation options

**Returns:** Promise<string> - Path to generated report

#### setStyle(style)

Set the report visual style.

```javascript
generator.setStyle('sports');
generator.setStyle('entertainment');
generator.setStyle('finance');
generator.setStyle('politics');
generator.setStyle('military');
generator.setStyle('custom');
```

#### addSection(section)

Add a section to the report.

```javascript
generator.addSection({
  heading: 'Analysis',
  content: '<p>Analysis content</p>',
  level: 2
});
```

#### addChart(chartConfig)

Add a chart to the report.

```javascript
generator.addChart({
  type: 'bar',
  title: 'Sales by Region',
  data: {
    labels: ['North', 'South', 'East', 'West'],
    values: [100, 200, 150, 180]
  }
});
```

#### addTable(tableConfig)

Add a table to the report.

```javascript
generator.addTable({
  headers: ['Name', 'Value', 'Change'],
  rows: [
    ['Item 1', '100', '+10%'],
    ['Item 2', '200', '-5%']
  ]
});
```

#### save(outputPath)

Save the report to file.

```javascript
await generator.save('./reports/my-report.html');
```

## Class: PDFConverter

```javascript
const { PDFConverter } = require('./src/reports/PDFConverter');
```

### Methods

#### convert(htmlPath, outputPath, options?)

Convert HTML to PDF.

```javascript
const converter = new PDFConverter();

await converter.convert('./reports/report.html', './reports/report.pdf', {
  format: 'A4',
  margin: '10mm',
  printBackground: true,
  scale: 1
});
```

**Parameters:**
- `htmlPath` (string): Path to HTML file
- `outputPath` (string): Output PDF path
- `options` (Object): PDF options
  - `format` (string): 'A4', 'Letter', 'Legal'
  - `margin` (string): Margin in mm
  - `printBackground` (boolean): Print background colors
  - `scale` (number): Scale factor
  - `headerTemplate` (string): HTML for header
  - `footerTemplate` (string): HTML for footer

**Returns:** Promise<string> - Path to generated PDF

#### convertFromHtml(htmlContent, outputPath, options?)

Convert HTML string to PDF.

```javascript
const pdfPath = await converter.convertFromHtml(htmlString, './output.pdf');
```

## Class: PPTConverter

```javascript
const { PPTConverter } = require('./src/reports/PPTConverter');
```

### Methods

#### convert(htmlPath, outputPath, options?)

Convert HTML to PowerPoint.

```javascript
const converter = new PPTConverter();

await converter.convert('./reports/report.html', './reports/presentation.pptx', {
  layout: 'title_slide',
  theme: 'modern'
});
```

#### addSlide(slideData)

Add a slide to the presentation.

```javascript
converter.addSlide({
  title: 'Slide Title',
  content: 'Slide content',
  layout: 'title_and_content',
  background: '#ffffff'
});
```

#### addImageSlide(imagePath, caption?)

Add an image slide.

```javascript
converter.addImageSlide('./charts/sales.png', 'Q4 Sales Chart');
```

#### save(outputPath)

Save the presentation.

```javascript
await converter.save('./presentation.pptx');
```

## Report Styles

### Sports Style
- Energetic color palette (blues, greens, dynamic accents)
- Bold typography
- Scoreboard-style layouts

### Entertainment Style
- Vibrant colors (purple, pink, gold)
- Expressive fonts
- Card-based layouts

### Finance Style
- Professional blues and grays
- Clean serif/sans-serif typography
- Data-focused layouts with tables and charts

### Politics Style
- Traditional colors (red, navy, white)
- Formal typography
- Document-style layouts

### Military Style
- Olive, tan, dark green palette
- Clean, structured layouts
- Mission-focused organization

## Example: Complete Report Generation

```javascript
const { ReportGenerator, PDFConverter, PPTConverter } = require('./src/reports');

async function main() {
  // Create report
  const generator = new ReportGenerator({
    style: 'finance',
    outputDir: './reports'
  });

  // Add content
  generator.addSection({
    heading: 'Executive Summary',
    content: '<p>Key findings and recommendations...</p>'
  });

  // Add chart
  generator.addChart({
    type: 'line',
    title: 'Revenue Trend',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr'],
      values: [100, 120, 110, 130]
    }
  });

  // Add table
  generator.addTable({
    headers: ['Product', 'Q1 Sales', 'Q2 Sales'],
    rows: [
      ['Product A', '$50,000', '$55,000'],
      ['Product B', '$30,000', '$35,000']
    ]
  });

  // Generate HTML
  const htmlPath = await generator.save('./reports/quarterly-report.html');

  // Convert to PDF
  const pdfConverter = new PDFConverter();
  const pdfPath = await pdfConverter.convert(htmlPath, './reports/quarterly-report.pdf');

  // Convert to PPT
  const pptConverter = new PPTConverter();
  await pptConverter.convert(htmlPath, './reports/quarterly-presentation.pptx');

  console.log('Reports generated:', { htmlPath, pdfPath });
}

main();
```
