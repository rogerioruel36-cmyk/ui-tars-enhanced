/**
 * PDF Converter
 * P2-F2: 使用 Puppeteer 实现 HTML 到 PDF 高保真导出
 *
 * Features:
 * - 高保真 HTML 到 PDF 转换
 * - 支持自定义页面尺寸、边距、方向
 * - 支持页眉页脚
 * - 支持水印
 * - 支持多页长内容自动分页
 * - 支持打印样式优化
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class PDFConverter {
  constructor(options = {}) {
    this.options = {
      // 页面设置
      format: options.format || 'A4',
      width: options.width,
      height: options.height,
      landscape: options.landscape || false,

      // 边距设置
      margin: options.margin || {
        top: '20mm',
        bottom: '20mm',
        left: '20mm',
        right: '20mm'
      },

      // 打印设置
      printBackground: options.printBackground !== false,
      scale: options.scale || 1.0,

      // 页眉页脚
      displayHeaderFooter: options.displayHeaderFooter || false,
      headerTemplate: options.headerTemplate || '',
      footerTemplate: options.footerTemplate || '',

      // 其他选项
      preferCSSPageSize: options.preferCSSPageSize || false,
      timeout: options.timeout || 30000,

      // 水印
      watermark: options.watermark || null
    };

    this.browser = null;
  }

  /**
   * 初始化浏览器
   */
  async _initBrowser() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu'
        ]
      });
    }
    return this.browser;
  }

  /**
   * 关闭浏览器
   */
  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * 将 HTML 字符串转换为 PDF
   */
  async fromHTML(html, outputPath, options = {}) {
    const mergedOptions = { ...this.options, ...options };
    const browser = await this._initBrowser();
    const page = await browser.newPage();

    try {
      // 设置 HTML 内容 - 使用 domcontentloaded 避免网络超时
      await page.setContent(html, {
        waitUntil: 'domcontentloaded',
        timeout: mergedOptions.timeout
      });

      // 等待页面渲染完成
      await page.evaluate(() => document.readyState);

      // 如果有水印，注入水印样式
      if (mergedOptions.watermark) {
        await this._addWatermark(page, mergedOptions.watermark);
      }

      // 生成 PDF
      const pdfBuffer = await page.pdf({
        format: mergedOptions.format,
        width: mergedOptions.width,
        height: mergedOptions.height,
        landscape: mergedOptions.landscape,
        margin: mergedOptions.margin,
        printBackground: mergedOptions.printBackground,
        scale: mergedOptions.scale,
        displayHeaderFooter: mergedOptions.displayHeaderFooter,
        headerTemplate: mergedOptions.headerTemplate,
        footerTemplate: mergedOptions.footerTemplate,
        preferCSSPageSize: mergedOptions.preferCSSPageSize,
        timeout: mergedOptions.timeout
      });

      // 保存到文件
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(outputPath, pdfBuffer);
      return outputPath;
    } finally {
      await page.close();
    }
  }

  /**
   * 从 HTML 文件转换为 PDF
   */
  async fromFile(htmlPath, outputPath, options = {}) {
    const html = fs.readFileSync(htmlPath, 'utf-8');
    return this.fromHTML(html, outputPath, options);
  }

  /**
   * 从 URL 转换为 PDF
   */
  async fromURL(url, outputPath, options = {}) {
    const mergedOptions = { ...this.options, ...options };
    const browser = await this._initBrowser();
    const page = await browser.newPage();

    try {
      // 设置视口大小
      await page.setViewport({
        width: mergedOptions.width || 1200,
        height: mergedOptions.height || 800
      });

      // 导航到 URL
      await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: mergedOptions.timeout
      });

      // 如果有水印，注入水印样式
      if (mergedOptions.watermark) {
        await this._addWatermark(page, mergedOptions.watermark);
      }

      // 生成 PDF
      const pdfBuffer = await page.pdf({
        format: mergedOptions.format,
        width: mergedOptions.width,
        height: mergedOptions.height,
        landscape: mergedOptions.landscape,
        margin: mergedOptions.margin,
        printBackground: mergedOptions.printBackground,
        scale: mergedOptions.scale,
        displayHeaderFooter: mergedOptions.displayHeaderFooter,
        headerTemplate: mergedOptions.headerTemplate,
        footerTemplate: mergedOptions.footerTemplate,
        preferCSSPageSize: mergedOptions.preferCSSPageSize,
        timeout: mergedOptions.timeout
      });

      // 保存到文件
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(outputPath, pdfBuffer);
      return outputPath;
    } finally {
      await page.close();
    }
  }

  /**
   * 添加水印
   */
  async _addWatermark(page, watermark) {
    const watermarkText = watermark.text || 'WATERMARK';
    const watermarkOpacity = watermark.opacity || 0.1;
    const watermarkAngle = watermark.angle || -30;

    await page.addStyleTag({
      content: `
        body::after {
          content: "${watermarkText}";
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(${watermarkAngle}deg);
          font-size: 80px;
          color: rgba(128, 128, 128, ${watermarkOpacity});
          pointer-events: none;
          z-index: 9999;
          white-space: nowrap;
        }
      `
    });
  }

  /**
   * 创建页眉模板
   */
  static createHeaderTemplate(title, options = {}) {
    const fontSize = options.fontSize || '12px';
    const color = options.color || '#666666';

    return `
      <div style="font-size: ${fontSize}; color: ${color}; padding: 10px 20px; width: 100%; display: flex; justify-content: space-between;">
        <span>${title}</span>
        <span></span>
      </div>
    `;
  }

  /**
   * 创建页脚模板
   */
  static createFooterTemplate(options = {}) {
    const fontSize = options.fontSize || '10px';
    const color = options.color || '#999999';

    return `
      <div style="font-size: ${fontSize}; color: ${color}; padding: 10px 20px; width: 100%; display: flex; justify-content: space-between;">
        <span></span>
        <span><span class="pageNumber"></span> / <span class="totalPages"></span></span>
      </div>
    `;
  }

  /**
   * 获取支持的页面格式
   */
  static getSupportedFormats() {
    return ['A0', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'Letter', 'Legal', 'Tabloid', 'Ledger'];
  }

  /**
   * 创建 PDF 转换器（工厂方法）
   */
  static create(options = {}) {
    return new PDFConverter(options);
  }

  /**
   * 快速转换（静态方法）
   */
  static async convert(html, outputPath, options = {}) {
    const converter = new PDFConverter(options);
    try {
      return await converter.fromHTML(html, outputPath);
    } finally {
      await converter.close();
    }
  }

  /**
   * 快速从文件转换（静态方法）
   */
  static async convertFile(htmlPath, outputPath, options = {}) {
    const converter = new PDFConverter(options);
    try {
      return await converter.fromFile(htmlPath, outputPath);
    } finally {
      await converter.close();
    }
  }

  /**
   * 快速从 URL 转换（静态方法）
   */
  static async convertURL(url, outputPath, options = {}) {
    const converter = new PDFConverter(options);
    try {
      return await converter.fromURL(url, outputPath);
    } finally {
      await converter.close();
    }
  }
}

module.exports = PDFConverter;
