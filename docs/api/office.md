# Office Document Processing API

## Overview

The Office module provides Word and Excel document processing using docx.js and ExcelJS.

## Class: WordProcessor

```javascript
const { WordProcessor } = require('./src/office/WordProcessor');
```

### Constructor

```javascript
new WordProcessor(options?)
```

### Methods

#### load(documentPath)

Load a Word document.

```javascript
const doc = new WordProcessor();
await doc.load('./documents/report.docx');
```

#### create(options?)

Create a new Word document.

```javascript
const doc = new WordProcessor();
await doc.create({
  title: 'My Document',
  author: 'Author Name'
});
```

#### addParagraph(text, options?)

Add a paragraph.

```javascript
doc.addParagraph('Hello World');
doc.addParagraph('Bold text', { bold: true });
doc.addParagraph('Heading', { heading: 1 });
```

#### addHeading(text, level)

Add a heading.

```javascript
doc.addHeading('Chapter 1', 1);
doc.addHeading('Section 1.1', 2);
```

#### addTable(data)

Add a table.

```javascript
doc.addTable({
  headers: ['Name', 'Age', 'City'],
  rows: [
    ['John', '30', 'NYC'],
    ['Jane', '25', 'LA']
  ]
});
```

#### addImage(imagePath, options?)

Add an image.

```javascript
doc.addImage('./images/chart.png', {
  width: 400,
  height: 300
});
```

#### addList(items, ordered?)

Add a list.

```javascript
doc.addList(['Item 1', 'Item 2', 'Item 3'], false);
```

#### save(outputPath)

Save the document.

```javascript
await doc.save('./output/document.docx');
```

## Class: ExcelProcessor

```javascript
const { ExcelProcessor } = require('./src/office/ExcelProcessor');
```

### Constructor

```javascript
new ExcelProcessor(options?)
```

### Methods

#### load(documentPath)

Load an Excel workbook.

```javascript
const excel = new ExcelProcessor();
await excel.load('./data/spreadsheet.xlsx');
```

#### create(sheetName?)

Create a new workbook.

```javascript
const excel = new ExcelProcessor();
await excel.create('Sales Data');
```

#### getSheet(sheetName)

Get a sheet by name.

```javascript
const sheet = excel.getSheet('Sales Data');
```

#### addSheet(sheetName)

Add a new sheet.

```javascript
excel.addSheet('Q1 2026');
```

#### writeCell(sheet, cell, value)

Write to a cell.

```javascript
excel.writeCell('Sheet1', 'A1', 'Header');
excel.writeCell('Sheet1', 'B1', 'Value');
```

#### writeRow(sheet, row, values)

Write a row.

```javascript
excel.writeRow('Sheet1', 1, ['Name', 'Value', 'Date']);
```

#### writeRange(sheet, range, values)

Write a range of cells.

```javascript
excel.writeRange('Sheet1', 'A2:C5', [
  ['A1', 'B1', 'C1'],
  ['A2', 'B2', 'C2'],
  ['A3', 'B3', 'C3'],
  ['A4', 'B4', 'C4']
]);
```

#### readCell(sheet, cell)

Read a cell value.

```javascript
const value = excel.readCell('Sheet1', 'A1');
```

#### readRow(sheet, row)

Read a row.

```javascript
const row = excel.readRow('Sheet1', 1);
```

#### readRange(sheet, range)

Read a range.

```javascript
const data = excel.readRange('Sheet1', 'A1:C10');
```

#### addChart(sheet, chartConfig)

Add a chart.

```javascript
excel.addChart('Sheet1', {
  type: 'bar',
  title: 'Sales Chart',
  range: 'A1:B10'
});
```

#### formatCell(sheet, cell, format)

Format a cell.

```javascript
excel.formatCell('Sheet1', 'A1', {
  bold: true,
  fontSize: 14,
  alignment: 'center'
});
```

#### save(outputPath)

Save the workbook.

```javascript
await excel.save('./output/spreadsheet.xlsx');
```

## Example: Word Document

```javascript
const { WordProcessor } = require('./src/office/WordProcessor');

async function main() {
  const doc = new WordProcessor();

  await doc.create({ title: 'Quarterly Report' });

  // Add title
  doc.addHeading('Q1 2026 Report', 1);

  // Add content
  doc.addParagraph('This report summarizes the key achievements and metrics for Q1 2026.');

  doc.addHeading('Revenue Overview', 2);
  doc.addParagraph('Total revenue increased by 25% compared to the previous quarter.');

  // Add table
  doc.addTable({
    headers: ['Month', 'Revenue', 'Growth'],
    rows: [
      ['January', '$100,000', '10%'],
      ['February', '$120,000', '20%'],
      ['March', '$150,000', '25%']
    ]
  });

  // Add image
  doc.addImage('./charts/revenue.png', { width: 500 });

  // Save
  await doc.save('./reports/q1-report.docx');
}

main();
```

## Example: Excel Spreadsheet

```javascript
const { ExcelProcessor } = require('./src/office/ExcelProcessor');

async function main() {
  const excel = new ExcelProcessor();

  await excel.create('Sales Data');

  // Write headers
  excel.writeRow('Sales Data', 1, ['Product', 'Region', 'Q1', 'Q2', 'Q3', 'Q4']);

  // Write data
  excel.writeRow('Sales Data', 2, ['Product A', 'North', 100, 120, 150, 180]);
  excel.writeRow('Sales Data', 3, ['Product A', 'South', 80, 90, 110, 130]);
  excel.writeRow('Sales Data', 4, ['Product B', 'North', 200, 220, 250, 280]);

  // Format header row
  excel.formatCell('Sales Data', 'A1', { bold: true, fontSize: 12 });
  excel.formatCell('Sales Data', 'B1', { bold: true, fontSize: 12 });
  excel.formatCell('Sales Data', 'C1', { bold: true, fontSize: 12 });

  // Add chart
  excel.addChart('Sales Data', {
    type: 'column',
    title: 'Sales by Product',
    range: 'A1:F4'
  });

  // Save
  await excel.save('./reports/sales-data.xlsx');
}

main();
```
