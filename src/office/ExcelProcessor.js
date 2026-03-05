/**
 * Excel Spreadsheet Processor
 * Handles Excel spreadsheet creation, reading, and editing using ExcelJS
 */

const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

class ExcelProcessor {
  constructor() {
    this.workbook = new ExcelJS.Workbook();
    this.filePath = null;
  }

  /**
   * Create a new workbook
   */
  createNew() {
    this.workbook = new ExcelJS.Workbook();
    return this;
  }

  /**
   * Load an existing Excel file
   * @param {string} filePath - Path to the .xlsx file
   */
  async load(filePath) {
    this.filePath = filePath;
    await this.workbook.xlsx.readFile(filePath);
    return this;
  }

  /**
   * Add a new worksheet
   * @param {string} name - Sheet name
   */
  addSheet(name) {
    const sheet = this.workbook.addWorksheet(name);
    return sheet;
  }

  /**
   * Get a worksheet by name or index
   * @param {string|number} sheet - Sheet name or index
   */
  getSheet(sheet) {
    if (typeof sheet === 'number') {
      return this.workbook.getWorksheet(sheet);
    }
    return this.workbook.getWorksheet(sheet);
  }

  /**
   * Add data to a worksheet
   * @param {string} sheetName - Sheet name
   * @param {Array<Array>} data - 2D array of cell data
   * @param {object} options - Options (startRow, startCol, headers)
   */
  addData(sheetName, data, options = {}) {
    const sheet = this.getSheet(sheetName) || this.addSheet(sheetName);

    const startRow = options.startRow || 1;
    const startCol = options.startCol || 1;

    if (options.headers) {
      const headerRow = sheet.getRow(startRow);
      options.headers.forEach((header, index) => {
        headerRow.getCell(startCol + index).value = header;
        headerRow.getCell(startCol + index).font = { bold: true };
        headerRow.getCell(startCol + index).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE0E0E0' }
        };
      });
      headerRow.commit();
    }

    data.forEach((row, rowIndex) => {
      const rowObj = sheet.getRow(startRow + (options.headers ? 1 : 0) + rowIndex);
      row.forEach((cell, colIndex) => {
        const cellObj = rowObj.getCell(startCol + colIndex);

        if (typeof cell === 'object' && cell !== null) {
          cellObj.value = cell.value;
          if (cell.style) {
            Object.assign(cellObj, cell.style);
          }
        } else {
          cellObj.value = cell;
        }
      });
      rowObj.commit();
    });

    return this;
  }

  /**
   * Add a cell value
   * @param {string} sheetName - Sheet name
   * @param {number} row - Row number (1-indexed)
   * @param {number} col - Column number (1-indexed)
   * @param {any} value - Cell value
   * @param {object} style - Cell style
   */
  setCell(sheetName, row, col, value, style = {}) {
    const sheet = this.getSheet(sheetName) || this.addSheet(sheetName);
    const cell = sheet.getCell(row, col);
    cell.value = value;

    if (style.font) cell.font = style.font;
    if (style.fill) cell.fill = style.fill;
    if (style.border) cell.border = style.border;
    if (style.alignment) cell.alignment = style.alignment;
    if (style.numFmt) cell.numFmt = style.numFmt;

    return this;
  }

  /**
   * Get a cell value
   * @param {string} sheetName - Sheet name
   * @param {number} row - Row number
   * @param {number} col - Column number
   */
  getCell(sheetName, row, col) {
    const sheet = this.getSheet(sheetName);
    if (!sheet) return null;
    return sheet.getCell(row, col).value;
  }

  /**
   * Add a formula to a cell
   * @param {string} sheetName - Sheet name
   * @param {number} row - Row number
   * @param {number} col - Column number
   * @param {string} formula - Formula (e.g., "SUM(A1:A10)")
   */
  setFormula(sheetName, row, col, formula) {
    const sheet = this.getSheet(sheetName) || this.addSheet(sheetName);
    const cell = sheet.getCell(row, col);
    cell.value = { formula: formula };
    return this;
  }

  /**
   * Merge cells
   * @param {string} sheetName - Sheet name
   * @param {string} range - Range (e.g., "A1:B2")
   */
  mergeCells(sheetName, range) {
    const sheet = this.getSheet(sheetName) || this.addSheet(sheetName);
    sheet.mergeCells(range);
    return this;
  }

  /**
   * Set column width
   * @param {string} sheetName - Sheet name
   * @param {number} col - Column number
   * @param {number} width - Width in characters
   */
  setColumnWidth(sheetName, col, width) {
    const sheet = this.getSheet(sheetName) || this.addSheet(sheetName);
    sheet.getColumn(col).width = width;
    return this;
  }

  /**
   * Set row height
   * @param {string} sheetName - Sheet name
   * @param {number} row - Row number
   * @param {number} height - Height in points
   */
  setRowHeight(sheetName, row, height) {
    const sheet = this.getSheet(sheetName) || this.addSheet(sheetName);
    sheet.getRow(row).height = height;
    return this;
  }

  /**
   * Add a chart
   * @param {string} sheetName - Sheet name
   * @param {object} chartConfig - Chart configuration
   */
  addChart(sheetName, chartConfig) {
    const sheet = this.getSheet(sheetName) || this.addSheet(sheetName);

    const chart = this.workbook.addChart(chartConfig.type, {
      title: chartConfig.title,
      style: chartConfig.style,
      xAxis: chartConfig.xAxis,
      yAxis: chartConfig.yAxis,
      series: chartConfig.series
    });

    sheet.addChart(chart);
    return this;
  }

  /**
   * Add an image
   * @param {string} sheetName - Sheet name
   * @param {string} imagePath - Path to image
   * @param {object} options - Image options (hyperlink, range)
   */
  addImage(sheetName, imagePath, options = {}) {
    const sheet = this.getSheet(sheetName) || this.addSheet(sheetName);

    const imageId = this.workbook.addImage({
      filename: imagePath,
      extension: path.extname(imagePath).slice(1)
    });

    sheet.addImage(imageId, options.range || 'A1');
    return this;
  }

  /**
   * Set workbook properties
   * @param {object} props - Workbook properties
   */
  setProperties(props) {
    if (props.creator) this.workbook.creator = props.creator;
    if (props.created) this.workbook.createdDate = new Date(props.created);
    if (props.modified) this.workbook.modifiedDate = new Date(props.modified);
    if (props.title) this.workbook.title = props.title;
    if (props.subject) this.workbook.subject = props.subject;
    return this;
  }

  /**
   * Save the workbook to a file
   * @param {string} filePath - Output file path
   */
  async save(filePath) {
    await this.workbook.xlsx.writeFile(filePath);
    this.filePath = filePath;
    return filePath;
  }

  /**
   * Create a workbook from data
   * @param {object} data - Workbook data
   */
  async createFromData(data) {
    this.createNew();

    if (data.properties) {
      this.setProperties(data.properties);
    }

    if (data.sheets) {
      for (const sheetData of data.sheets) {
        const sheet = this.addSheet(sheetData.name);

        if (sheetData.columns) {
          sheetData.columns.forEach(col => {
            sheet.getColumn(col.index).width = col.width;
          });
        }

        if (sheetData.data) {
          this.addData(sheetData.name, sheetData.data, sheetData.options || {});
        }

        if (sheetData.mergeCells) {
          sheetData.mergeCells.forEach(range => {
            sheet.mergeCells(range);
          });
        }

        if (sheetData.chart) {
          this.addChart(sheetData.name, sheetData.chart);
        }
      }
    }

    return this;
  }

  /**
   * Export to buffer
   * @returns {Promise<Buffer>}
   */
  async toBuffer() {
    return this.workbook.xlsx.writeBuffer();
  }

  /**
   * Static method to create a spreadsheet quickly
   * @param {string} outputPath - Output file path
   * @param {object} content - Workbook content
   */
  static async create(outputPath, content) {
    const processor = new ExcelProcessor();
    await processor.createFromData(content);
    await processor.save(outputPath);
    return outputPath;
  }

  /**
   * Get all sheet names
   */
  getSheetNames() {
    return this.workbook.worksheets.map(sheet => sheet.name);
  }

  /**
   * Get worksheet data as 2D array
   * @param {string} sheetName - Sheet name
   */
  getSheetData(sheetName) {
    const sheet = this.getSheet(sheetName);
    if (!sheet) return [];

    const data = [];
    sheet.eachRow((row, rowNumber) => {
      const rowData = [];
      row.eachCell((cell, colNumber) => {
        rowData.push(cell.value);
      });
      data.push(rowData);
    });

    return data;
  }
}

module.exports = ExcelProcessor;
