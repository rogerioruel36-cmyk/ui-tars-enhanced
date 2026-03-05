/**
 * Office Module Test
 * Tests Word and Excel document processing
 */

const fs = require('fs');
const path = require('path');
const { OfficeProcessor, WordProcessor, ExcelProcessor } = require('./src/office');

const TEST_DIR = './test-output';

// Ensure test directory exists
if (!fs.existsSync(TEST_DIR)) {
  fs.mkdirSync(TEST_DIR, { recursive: true });
}

async function testWord() {
  console.log('=== Testing Word Processor ===');

  const wordData = {
    title: 'Test Report',
    sections: [
      {
        heading: 'Introduction',
        level: 1
      },
      {
        content: 'This is a test document created by the Office Module. It demonstrates the ability to create professional Word documents with various formatting options.',
        style: { fontSize: 24 }
      },
      {
        heading: 'Data Table',
        level: 2
      },
      {
        table: {
          data: [
            ['Name', 'Age', 'City'],
            ['John Doe', '30', 'New York'],
            ['Jane Smith', '25', 'Los Angeles'],
            ['Bob Johnson', '35', 'Chicago']
          ],
          options: { header: true }
        }
      },
      {
        heading: 'Conclusion',
        level: 1
      },
      {
        content: 'This document was successfully created using the WordProcessor class.',
        style: { italic: true }
      }
    ]
  };

  const outputPath = path.join(TEST_DIR, 'test-document.docx');
  await WordProcessor.create(outputPath, wordData);

  if (fs.existsSync(outputPath)) {
    const stats = fs.statSync(outputPath);
    console.log(`✓ Word document created: ${outputPath} (${stats.size} bytes)`);
  } else {
    console.log('✗ Word document creation failed');
    process.exit(1);
  }
}

async function testExcel() {
  console.log('\n=== Testing Excel Processor ===');

  const excelData = {
    properties: {
      title: 'Sales Report',
      subject: 'Q1 2024 Sales Data',
      creator: 'Office Module Test',
    },
    sheets: [
      {
        name: 'Sales Data',
        options: {
          headers: ['Product', 'Q1', 'Q2', 'Q3', 'Q4', 'Total']
        },
        data: [
          ['Widget A', 100, 150, 200, 175],
          ['Widget B', 80, 90, 120, 140],
          ['Widget C', 60, 70, 85, 95],
          ['Gadget X', 200, 220, 250, 280]
        ],
        columns: [
          { index: 1, width: 15 },
          { index: 2, width: 10 },
          { index: 3, width: 10 },
          { index: 4, width: 10 },
          { index: 5, width: 10 },
          { index: 6, width: 12 }
        ]
      },
      {
        name: 'Summary',
        data: [
          ['Total Products', '=Sales Data!A5'],
          ['Total Q1', '=SUM(Sales Data!B2:B5)'],
          ['Total Q2', '=SUM(Sales Data!C2:C5)'],
          ['Total Q3', '=SUM(Sales Data!D2:D5)'],
          ['Total Q4', '=SUM(Sales Data!E2:E5)']
        ]
      }
    ]
  };

  const outputPath = path.join(TEST_DIR, 'test-spreadsheet.xlsx');
  await ExcelProcessor.create(outputPath, excelData);

  if (fs.existsSync(outputPath)) {
    const stats = fs.statSync(outputPath);
    console.log(`✓ Excel workbook created: ${outputPath} (${stats.size} bytes)`);
  } else {
    console.log('✗ Excel workbook creation failed');
    process.exit(1);
  }
}

async function testOfficeProcessor() {
  console.log('\n=== Testing Office Processor ===');

  const processor = new OfficeProcessor();

  // Test Word via OfficeProcessor
  const wordPath = path.join(TEST_DIR, 'office-test.docx');
  await processor.createWord(wordPath, {
    title: 'Unified Test',
    paragraphs: [{ text: 'Test via OfficeProcessor' }]
  });
  console.log(`✓ OfficeProcessor Word: ${wordPath}`);

  // Test Excel via OfficeProcessor
  const excelPath = path.join(TEST_DIR, 'office-test.xlsx');
  await processor.createExcel(excelPath, {
    sheets: [{ name: 'Sheet1', data: [['Test', 'Value'], ['A', 1]] }]
  });
  console.log(`✓ OfficeProcessor Excel: ${excelPath}`);
}

async function runTests() {
  console.log('Starting Office Module Tests...\n');

  try {
    await testWord();
    await testExcel();
    await testOfficeProcessor();

    console.log('\n=== All Tests Passed ===');
    console.log('Office Module is working correctly!');

    // List created files
    console.log('\nCreated files:');
    const files = fs.readdirSync(TEST_DIR);
    files.forEach(file => {
      const filePath = path.join(TEST_DIR, file);
      const stats = fs.statSync(filePath);
      console.log(`  - ${file} (${stats.size} bytes)`);
    });

    process.exit(0);
  } catch (error) {
    console.error('\n✗ Test failed with error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

runTests();
