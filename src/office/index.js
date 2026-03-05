/**
 * Office Document Processing Module
 * Unified interface for Word and Excel document handling
 */

const WordProcessor = require('./WordProcessor');
const ExcelProcessor = require('./ExcelProcessor');

class OfficeProcessor {
  constructor() {
    this.word = new WordProcessor();
    this.excel = new ExcelProcessor();
  }

  /**
   * Create a Word document
   * @param {string} outputPath - Output file path
   * @param {object} content - Document content
   */
  async createWord(outputPath, content) {
    return WordProcessor.create(outputPath, content);
  }

  /**
   * Create an Excel workbook
   * @param {string} outputPath - Output file path
   * @param {object} content - Workbook content
   */
  async createExcel(outputPath, content) {
    return ExcelProcessor.create(outputPath, content);
  }

  /**
   * Load an existing Word document
   * @param {string} filePath - File path
   */
  async loadWord(filePath) {
    await this.word.load(filePath);
    return this.word;
  }

  /**
   * Load an existing Excel workbook
   * @param {string} filePath - File path
   */
  async loadExcel(filePath) {
    await this.excel.load(filePath);
    return this.excel;
  }

  /**
   * Get Word processor instance
   */
  getWordProcessor() {
    return this.word;
  }

  /**
   * Get Excel processor instance
   */
  getExcelProcessor() {
    return this.excel;
  }
}

// Export classes and factory function
module.exports = {
  OfficeProcessor,
  WordProcessor,
  ExcelProcessor
};

// Also export default for convenience
module.exports.default = OfficeProcessor;
