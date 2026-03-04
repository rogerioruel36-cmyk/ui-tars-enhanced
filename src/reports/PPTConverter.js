/**
 * PPT Converter
 * P2-F3: 使用 PptxGenJS 实现 HTML 到 PPT 导出，支持图表/图片
 *
 * Features:
 * - HTML 内容解析与转换
 * - 支持标题页、内容页、图表页、图片页
 * - 支持多种布局模板
 * - 支持主题颜色配置
 * - 支持图表插入 (柱状图、折线图、饼图等)
 * - 支持图片插入
 * - 支持表格
 */

const PptxGenJS = require('pptxgenjs');
const fs = require('fs');
const path = require('path');

// 内置主题定义
const BUILT_IN_THEMES = {
  sports: {
    name: '体育风格',
    primary: 'FF6B35',
    secondary: '004E89',
    accent: 'F7C548',
    background: 'F5F5F5',
    titleColor: '1A1A2E',
    textColor: '333333'
  },
  entertainment: {
    name: '娱乐风格',
    primary: 'FF1493',
    secondary: '9400D3',
    accent: '00CED1',
    background: 'FFFFFF',
    titleColor: '2D1B4E',
    textColor: '333333'
  },
  finance: {
    name: '财经风格',
    primary: '0D47A1',
    secondary: '1565C0',
    accent: '00C853',
    background: 'FFFFFF',
    titleColor: '0D47A1',
    textColor: '263238'
  },
  politics: {
    name: '政治风格',
    primary: '8B0000',
    secondary: '1A1A2E',
    accent: 'C9A227',
    background: 'FAFAFA',
    titleColor: '2C2C2C',
    textColor: '333333'
  },
  military: {
    name: '军事风格',
    primary: '2E5A1C',
    secondary: '4A5D23',
    accent: 'C4B538',
    background: 'F0F0E8',
    titleColor: '1A1F16',
    textColor: '2D3425'
  },
  default: {
    name: '默认风格',
    primary: '0078D4',
    secondary: '106EBE',
    accent: 'FFB900',
    background: 'FFFFFF',
    titleColor: '333333',
    textColor: '666666'
  }
};

class PPTConverter {
  constructor(options = {}) {
    this.options = {
      // 主题设置
      theme: options.theme || 'default',

      // 页面设置
      pageSize: options.pageSize || 'LAYOUT_16x9', // 16:9 或 LAYOUT_4x3

      // 标题设置
      title: options.title || 'PPT 演示文稿',
      subtitle: options.subtitle || '',
      author: options.author || 'UI-TARS',

      // 布局设置
      margin: options.margin || { top: 0.5, bottom: 0.5, left: 0.5, right: 0.5 },

      // 其他选项
      timeout: options.timeout || 30000
    };

    // 获取主题配置
    this.themeConfig = BUILT_IN_THEMES[this.options.theme] || BUILT_IN_THEMES.default;

    // PPT 对象
    this.pptx = null;
  }

  /**
   * 初始化 PPT 对象
   */
  _initPPT() {
    if (!this.pptx) {
      this.pptx = new PptxGenJS();
      this.pptx.layout = this.options.pageSize;
      this.pptx.author = this.options.author;
      this.pptx.title = this.options.title;
      this.pptx.subject = this.options.subtitle;
    }
    return this.pptx;
  }

  /**
   * 关闭并清理
   */
  close() {
    this.pptx = null;
  }

  /**
   * 从结构化数据生成 PPT
   */
  async fromData(data, outputPath, options = {}) {
    const pptx = this._initPPT();
    const mergedOptions = { ...this.options, ...options };
    const theme = this.themeConfig;

    // 设置主题色
    pptx.theme = {
      primary: theme.primary,
      secondary: theme.secondary,
      accent: theme.accent
    };

    // 生成幻灯片
    const slides = data.slides || [data];

    for (const slideData of slides) {
      this._addSlide(pptx, slideData, theme);
    }

    // 保存文件
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    await pptx.writeFile({ fileName: outputPath });
    return outputPath;
  }

  /**
   * 添加单张幻灯片
   */
  _addSlide(pptx, slideData, theme) {
    const slideType = slideData.type || 'content';
    let slide;

    switch (slideType) {
      case 'title':
        slide = this._createTitleSlide(pptx, slideData, theme);
        break;
      case 'content':
        slide = this._createContentSlide(pptx, slideData, theme);
        break;
      case 'two-column':
        slide = this._createTwoColumnSlide(pptx, slideData, theme);
        break;
      case 'chart':
        slide = this._createChartSlide(pptx, slideData, theme);
        break;
      case 'image':
        slide = this._createImageSlide(pptx, slideData, theme);
        break;
      case 'table':
        slide = this._createTableSlide(pptx, slideData, theme);
        break;
      case 'blank':
        slide = this._createBlankSlide(pptx, slideData, theme);
        break;
      default:
        slide = this._createContentSlide(pptx, slideData, theme);
    }

    return slide;
  }

  /**
   * 创建标题页
   */
  _createTitleSlide(pptx, data, theme) {
    const slide = pptx.addSlide();

    // 背景色
    slide.background = { color: theme.background };

    // 装饰线
    slide.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 2.5,
      w: '100%',
      h: 0.02,
      fill: { color: theme.primary }
    });

    // 主标题
    slide.addText(data.title || this.options.title, {
      x: 0.5,
      y: 2.8,
      w: '90%',
      h: 1,
      fontSize: 44,
      fontFace: 'Arial',
      color: theme.titleColor,
      bold: true,
      align: 'center'
    });

    // 副标题
    if (data.subtitle || this.options.subtitle) {
      slide.addText(data.subtitle || this.options.subtitle, {
        x: 0.5,
        y: 3.9,
        w: '90%',
        h: 0.5,
        fontSize: 24,
        fontFace: 'Arial',
        color: theme.textColor,
        align: 'center'
      });
    }

    // 作者信息
    if (data.author || this.options.author) {
      slide.addText(data.author || this.options.author, {
        x: 0.5,
        y: 5.2,
        w: '90%',
        h: 0.3,
        fontSize: 14,
        fontFace: 'Arial',
        color: theme.textColor,
        align: 'center'
      });
    }

    return slide;
  }

  /**
   * 创建内容页
   */
  _createContentSlide(pptx, data, theme) {
    const slide = pptx.addSlide();

    // 背景色
    slide.background = { color: theme.background };

    // 顶部装饰条
    slide.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 0,
      w: '100%',
      h: 0.08,
      fill: { color: theme.primary }
    });

    // 标题
    slide.addText(data.title || '', {
      x: 0.5,
      y: 0.3,
      w: '90%',
      h: 0.5,
      fontSize: 32,
      fontFace: 'Arial',
      color: theme.titleColor,
      bold: true
    });

    // 内容区域
    const contentX = 0.5;
    const contentY = 1;
    const contentW = '90%';
    const contentH = 4.5;

    if (data.content) {
      if (typeof data.content === 'string') {
        // 纯文本内容
        slide.addText(data.content, {
          x: contentX,
          y: contentY,
          w: contentW,
          h: contentH,
          fontSize: 18,
          fontFace: 'Arial',
          color: theme.textColor,
          lineSpacing: 32
        });
      } else if (Array.isArray(data.content)) {
        // 列表内容
        const bulletItems = data.content.map(item => {
          if (typeof item === 'string') {
            return { text: item, options: { bullet: true, color: theme.textColor } };
          } else if (typeof item === 'object') {
            return {
              text: item.text,
              options: {
                bullet: item.bullet !== false,
                color: theme.textColor,
                indentLevel: item.indent || 0
              }
            };
          }
          return null;
        }).filter(Boolean);

        slide.addText(bulletItems, {
          x: contentX,
          y: contentY,
          w: contentW,
          h: contentH,
          fontSize: 18,
          fontFace: 'Arial',
          lineSpacing: 36
        });
      }
    }

    // 页脚
    slide.addText(data.footer || `${this.options.title} - ${this.options.author}`, {
      x: 0.5,
      y: 5.3,
      w: '90%',
      h: 0.3,
      fontSize: 10,
      fontFace: 'Arial',
      color: theme.textColor,
      align: 'right'
    });

    return slide;
  }

  /**
   * 创建双栏内容页
   */
  _createTwoColumnSlide(pptx, data, theme) {
    const slide = pptx.addSlide();

    // 背景色
    slide.background = { color: theme.background };

    // 顶部装饰条
    slide.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 0,
      w: '100%',
      h: 0.08,
      fill: { color: theme.primary }
    });

    // 标题
    slide.addText(data.title || '', {
      x: 0.5,
      y: 0.3,
      w: '90%',
      h: 0.5,
      fontSize: 32,
      fontFace: 'Arial',
      color: theme.titleColor,
      bold: true
    });

    // 左侧内容
    if (data.left) {
      slide.addText(data.left.title || '', {
        x: 0.5,
        y: 1,
        w: '42%',
        h: 0.4,
        fontSize: 20,
        fontFace: 'Arial',
        color: theme.primary,
        bold: true
      });

      slide.addText(data.left.content || '', {
        x: 0.5,
        y: 1.5,
        w: '42%',
        h: 3.5,
        fontSize: 16,
        fontFace: 'Arial',
        color: theme.textColor,
        lineSpacing: 28
      });
    }

    // 右侧内容
    if (data.right) {
      slide.addText(data.right.title || '', {
        x: 5.3,
        y: 1,
        w: '42%',
        h: 0.4,
        fontSize: 20,
        fontFace: 'Arial',
        color: theme.primary,
        bold: true
      });

      slide.addText(data.right.content || '', {
        x: 5.3,
        y: 1.5,
        w: '42%',
        h: 3.5,
        fontSize: 16,
        fontFace: 'Arial',
        color: theme.textColor,
        lineSpacing: 28
      });
    }

    return slide;
  }

  /**
   * 创建图表页
   */
  _createChartSlide(pptx, data, theme) {
    const slide = pptx.addSlide();

    // 背景色
    slide.background = { color: theme.background };

    // 顶部装饰条
    slide.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 0,
      w: '100%',
      h: 0.08,
      fill: { color: theme.primary }
    });

    // 标题
    slide.addText(data.title || '', {
      x: 0.5,
      y: 0.3,
      w: '90%',
      h: 0.5,
      fontSize: 32,
      fontFace: 'Arial',
      color: theme.titleColor,
      bold: true
    });

    // 图表数据
    const chartData = data.chart || [];
    const chartType = data.chartType || 'bar';

    // 准备图表系列数据
    const series = [];
    const labels = chartData.length > 0 ? chartData[0].labels || [] : [];

    if (chartData.length > 0) {
      for (let i = 1; i < chartData.length; i++) {
        series.push({
          name: chartData[i].name || `Series ${i}`,
          labels: labels,
          values: chartData[i].values || []
        });
      }
    }

    // 创建图表选项
    const chartOptions = {
      x: 0.5,
      y: 1,
      w: '90%',
      h: 4.5,
      chartColors: [theme.primary, theme.secondary, theme.accent],
      barDir: chartType === 'bar' ? 'col' : 'bar',
      barGrouping: 'clustered',
      showValue: true,
      chartTitle: data.chartTitle || '',
      chartTitleFontSize: 14,
      catAxisTitle: data.xAxisTitle || '',
      valAxisTitle: data.yAxisTitle || ''
    };

    // 根据图表类型添加图表
    switch (chartType) {
      case 'line':
        slide.addChart(pptx.ChartType.line, series, chartOptions);
        break;
      case 'pie':
        slide.addChart(pptx.ChartType.pie, series, chartOptions);
        break;
      case 'doughnut':
        slide.addChart(pptx.ChartType.doughnut, series, chartOptions);
        break;
      default:
        slide.addChart(pptx.ChartType.bar, series, chartOptions);
    }

    return slide;
  }

  /**
   * 创建图片页
   */
  _createImageSlide(pptx, data, theme) {
    const slide = pptx.addSlide();

    // 背景色
    slide.background = { color: theme.background };

    // 顶部装饰条
    slide.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 0,
      w: '100%',
      h: 0.08,
      fill: { color: theme.primary }
    });

    // 标题
    slide.addText(data.title || '', {
      x: 0.5,
      y: 0.3,
      w: '90%',
      h: 0.5,
      fontSize: 32,
      fontFace: 'Arial',
      color: theme.titleColor,
      bold: true
    });

    // 图片描述
    if (data.description) {
      slide.addText(data.description, {
        x: 0.5,
        y: 0.9,
        w: '90%',
        h: 0.4,
        fontSize: 14,
        fontFace: 'Arial',
        color: theme.textColor,
        align: 'center'
      });
    }

    // 图片路径
    const imagePath = data.image;
    if (imagePath && fs.existsSync(imagePath)) {
      slide.addImage({
        path: imagePath,
        x: 1,
        y: 1.5,
        w: 8,
        h: 4,
        sizing: { type: 'contain', w: 8, h: 4 }
      });
    }

    return slide;
  }

  /**
   * 创建表格页
   */
  _createTableSlide(pptx, data, theme) {
    const slide = pptx.addSlide();

    // 背景色
    slide.background = { color: theme.background };

    // 顶部装饰条
    slide.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 0,
      w: '100%',
      h: 0.08,
      fill: { color: theme.primary }
    });

    // 标题
    slide.addText(data.title || '', {
      x: 0.5,
      y: 0.3,
      w: '90%',
      h: 0.5,
      fontSize: 32,
      fontFace: 'Arial',
      color: theme.titleColor,
      bold: true
    });

    // 表格数据
    const tableData = data.table || { headers: [], rows: [] };
    const headers = tableData.headers || [];
    const rows = tableData.rows || [];

    if (headers.length > 0) {
      // 准备表格数据
      const tableRows = [headers.map(h => ({
        text: h,
        options: {
          color: 'FFFFFF',
          fill: { color: theme.primary },
          bold: true,
          align: 'center',
          fontSize: 14
        }
      }))];

      for (const row of rows) {
        tableRows.push(row.map(cell => ({
          text: String(cell),
          options: {
            color: theme.textColor,
            fontSize: 12,
            align: 'center'
          }
        })));
      }

      slide.addTable(tableRows, {
        x: 0.5,
        y: 1,
        w: 9,
        h: rows.length * 0.5 + 0.5,
        colW: 9 / headers.length,
        border: { type: 'solid', pt: 1, color: 'DDDDDD' },
        fontFace: 'Arial'
      });
    }

    return slide;
  }

  /**
   * 创建空白页
   */
  _createBlankSlide(pptx, data, theme) {
    const slide = pptx.addSlide();
    slide.background = { color: theme.background };
    return slide;
  }

  /**
   * 从 HTML 字符串生成 PPT (基础版本 - 需要解析 HTML)
   */
  async fromHTML(html, outputPath, options = {}) {
    // HTML 解析是一个复杂的功能，这里提供基础实现
    // 实际使用时建议使用 fromData 方法传入结构化数据
    const pptx = this._initPPT();
    const theme = this.themeConfig;

    // 创建一个基础幻灯片
    const slide = pptx.addSlide();
    slide.background = { color: theme.background };

    // 提取标题 (简单解析)
    const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    const title = titleMatch ? titleMatch[1] : this.options.title;

    slide.addText(title, {
      x: 0.5,
      y: 2,
      w: '90%',
      h: 1,
      fontSize: 36,
      fontFace: 'Arial',
      color: theme.titleColor,
      bold: true,
      align: 'center'
    });

    // 提取段落文本
    const textMatches = html.match(/<p[^>]*>([^<]+)<\/p>/gi);
    if (textMatches && textMatches.length > 0) {
      const texts = textMatches.slice(0, 5).map(p => p.replace(/<[^>]+>/g, ''));
      slide.addText(texts.join('\n\n'), {
        x: 0.5,
        y: 3.2,
        w: '90%',
        h: 2,
        fontSize: 16,
        fontFace: 'Arial',
        color: theme.textColor,
        align: 'center'
      });
    }

    // 保存文件
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    await pptx.writeFile({ fileName: outputPath });
    return outputPath;
  }

  /**
   * 从 HTML 文件生成 PPT
   */
  async fromFile(htmlPath, outputPath, options = {}) {
    const html = fs.readFileSync(htmlPath, 'utf-8');
    return this.fromHTML(html, outputPath, options);
  }

  /**
   * 创建 PPT 转换器 (工厂方法)
   */
  static create(options = {}) {
    return new PPTConverter(options);
  }

  /**
   * 快速转换 (静态方法)
   */
  static async convert(data, outputPath, options = {}) {
    const converter = new PPTConverter(options);
    try {
      return await converter.fromData(data, outputPath);
    } finally {
      converter.close();
    }
  }

  /**
   * 快速从 HTML 转换 (静态方法)
   */
  static async convertHTML(html, outputPath, options = {}) {
    const converter = new PPTConverter(options);
    try {
      return await converter.fromHTML(html, outputPath);
    } finally {
      converter.close();
    }
  }

  /**
   * 获取支持的主题
   */
  static getSupportedThemes() {
    return Object.keys(BUILT_IN_THEMES).map(key => ({
      id: key,
      name: BUILT_IN_THEMES[key].name
    }));
  }

  /**
   * 获取支持的幻灯片类型
   */
  static getSupportedSlideTypes() {
    return [
      { id: 'title', name: '标题页' },
      { id: 'content', name: '内容页' },
      { id: 'two-column', name: '双栏内容页' },
      { id: 'chart', name: '图表页' },
      { id: 'image', name: '图片页' },
      { id: 'table', name: '表格页' },
      { id: 'blank', name: '空白页' }
    ];
  }
}

module.exports = PPTConverter;
module.exports.BUILT_IN_THEMES = BUILT_IN_THEMES;
