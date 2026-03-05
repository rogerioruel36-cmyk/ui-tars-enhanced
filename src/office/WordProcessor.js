/**
 * Word Document Processor
 * Handles Word document creation, reading, and editing using docx.js
 */

const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle, PageBreak, PageOrientation } = require('docx');
const fs = require('fs');
const path = require('path');

class WordProcessor {
  constructor() {
    this.document = null;
    this.filePath = null;
    this.children = [];
  }

  /**
   * Create a new empty document
   */
  createNew() {
    this.children = [];
    this.document = null;
    return this;
  }

  /**
   * Load an existing Word document
   * @param {string} filePath - Path to the .docx file
   */
  async load(filePath) {
    this.filePath = filePath;
    // For reading, we'll need to parse the document
    // This is a simplified version - full XML parsing would be needed for complex documents
    return this;
  }

  /**
   * Add a paragraph with text
   * @param {string} text - Text content
   * @param {object} options - Options for styling
   */
  addParagraph(text, options = {}) {
    const paragraph = new Paragraph({
      text: options.heading ? text : undefined,
      heading: options.heading || undefined,
      alignment: options.alignment || AlignmentType.LEFT,
      spacing: {
        after: options.spacingAfter || 200,
        before: options.spacingBefore || 200,
        line: options.lineSpacing || 240
      },
      bullet: options.bullet || undefined,
      children: [
        new TextRun({
          text: text,
          bold: options.bold || false,
          italic: options.italic || false,
          underline: options.underline || false,
          color: options.color || '000000',
          size: options.fontSize || 22, // in half-points
          font: options.fontFamily || 'Calibri'
        })
      ]
    });

    this.children.push(paragraph);
    return this;
  }

  /**
   * Add a heading
   * @param {string} text - Heading text
   * @param {number} level - Heading level (1-5)
   */
  addHeading(text, level = 1) {
    const headingLevels = {
      1: HeadingLevel.HEADING_1,
      2: HeadingLevel.HEADING_2,
      3: HeadingLevel.HEADING_3,
      4: HeadingLevel.HEADING_4,
      5: HeadingLevel.HEADING_5
    };

    return this.addParagraph(text, {
      heading: headingLevels[level] || HeadingLevel.HEADING_1,
      bold: true,
      fontSize: (5 - level) * 4 + 22 // 44, 36, 28, 24, 22
    });
  }

  /**
   * Add a table
   * @param {Array<Array<string>>} data - 2D array of cell data
   * @param {object} options - Table options
   */
  addTable(data, options = {}) {
    const rows = data.map(rowData =>
      new TableRow({
        children: rowData.map(cellData =>
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: cellData || '',
                    bold: options.header || false
                  })
                ]
              })
            ],
            shading: options.header ? { fill: 'CCCCCC' } : undefined
          })
        )
      })
    );

    const table = new Table({
      rows: rows,
      width: {
        size: 100,
        type: WidthType.PERCENTAGE
      }
    });

    this.children.push(table);
    return this;
  }

  /**
   * Add a page break
   */
  addPageBreak() {
    const pageBreak = new Paragraph({
      children: [new PageBreak()]
    });

    this.children.push(pageBreak);
    return this;
  }

  /**
   * Set document properties
   * @param {object} props - Document properties
   */
  setProperties(props) {
    // Document properties are set during construction
    return this;
  }

  /**
   * Build the document
   */
  build() {
    this.document = new Document({
      sections: [{
        properties: {},
        children: this.children
      }]
    });
    return this.document;
  }

  /**
   * Save the document to a file
   * @param {string} filePath - Output file path
   */
  async save(filePath) {
    this.build();

    const buffer = await Packer.toBuffer(this.document);
    fs.writeFileSync(filePath, buffer);
    this.filePath = filePath;
    return filePath;
  }

  /**
   * Create a document from a template with data
   * @param {string} templatePath - Path to template (optional)
   * @param {object} data - Data to populate
   */
  async createFromData(data) {
    this.createNew();

    if (data.title) {
      this.addHeading(data.title, 1);
    }

    if (data.sections) {
      for (const section of data.sections) {
        if (section.heading) {
          this.addHeading(section.heading, section.level || 2);
        }
        if (section.content) {
          this.addParagraph(section.content, section.style || {});
        }
        if (section.table) {
          this.addTable(section.table.data, section.table.options || {});
        }
        if (section.pageBreak) {
          this.addPageBreak();
        }
      }
    }

    if (data.paragraphs) {
      for (const p of data.paragraphs) {
        this.addParagraph(p.text, p.options || {});
      }
    }

    return this;
  }

  /**
   * Export to buffer
   * @returns {Promise<Buffer>}
   */
  async toBuffer() {
    this.build();
    return Packer.toBuffer(this.document);
  }

  /**
   * Static method to create a simple document quickly
   * @param {string} outputPath - Output file path
   * @param {object} content - Document content
   */
  static async create(outputPath, content) {
    const processor = new WordProcessor();
    await processor.createFromData(content);
    await processor.save(outputPath);
    return outputPath;
  }
}

module.exports = WordProcessor;
