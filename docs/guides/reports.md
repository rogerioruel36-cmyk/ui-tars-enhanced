# Report Customization Guide

## Report Styles

UI-TARS provides 5 built-in report styles:

### 1. Sports Style
```javascript
const generator = new ReportGenerator({ style: 'sports' });
```
- Energetic color palette
- Bold typography
- Dynamic layouts

### 2. Entertainment Style
```javascript
const generator = new ReportGenerator({ style: 'entertainment' });
```
- Vibrant colors
- Expressive fonts
- Card-based layouts

### 3. Finance Style
```javascript
const generator = new ReportGenerator({ style: 'finance' });
```
- Professional blues and grays
- Clean typography
- Data-focused layouts

### 4. Politics Style
```javascript
const generator = new ReportGenerator({ style: 'politics' });
```
- Traditional colors
- Formal typography
- Document-style layouts

### 5. Military Style
```javascript
const generator = new ReportGenerator({ style: 'military' });
```
- Olive and tan palette
- Structured layouts
- Mission-focused design

## Creating Custom Reports

### Custom Template

```javascript
const generator = new ReportGenerator({
  template: './templates/my-custom-template.html'
});
```

### Programmatic Content

```javascript
// Add sections
generator.addSection({
  heading: 'Title',
  content: '<p>Content</p>',
  level: 1
});

// Add charts
generator.addChart({
  type: 'bar',
  title: 'Sales Chart',
  data: {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    values: [100, 200, 150, 300]
  },
  options: {
    colors: ['#3498db', '#2ecc71', '#e74c3c', '#f39c12']
  }
});

// Add tables
generator.addTable({
  headers: ['Name', 'Value', 'Change'],
  rows: [
    ['Product A', '$10,000', '+15%'],
    ['Product B', '$8,000', '-5%']
  ],
  style: 'striped'
});

// Add images
generator.addImage('./charts/revenue.png', {
  caption: 'Revenue Trend',
  width: 600
});
```

## PDF Export Options

```javascript
const pdfConverter = new PDFConverter();

await pdfConverter.convert(htmlPath, outputPath, {
  format: 'A4',
  margin: '10mm',
  printBackground: true,
  scale: 1.0,
  headerTemplate: '<div style="font-size:10px">Header</div>',
  footerTemplate: '<div style="font-size:10px">Page <span class="pageNumber"></span></div>'
});
```

## PPT Export Options

```javascript
const pptConverter = new PPTConverter();

await pptConverter.convert(htmlPath, outputPath, {
  layout: 'title_slide',
  theme: 'modern',
  slides: [
    { title: 'Slide 1', content: '...' },
    { title: 'Slide 2', content: '...' }
  ]
});
```

## Adding Charts

Supported chart types:
- `bar` - Bar chart
- `line` - Line chart
- `pie` - Pie chart
- `doughnut` - Doughnut chart
- `radar` - Radar chart

```javascript
generator.addChart({
  type: 'bar',
  title: 'Sales by Region',
  data: {
    labels: ['North', 'South', 'East', 'West'],
    datasets: [
      { label: '2025', values: [100, 150, 80, 120] },
      { label: '2026', values: [120, 180, 100, 150] }
    ]
  }
});
```
