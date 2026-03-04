/**
 * PDF Converter Example
 * 展示 P2-F2: PDF 转换器的使用方法
 */

const ReportGenerator = require('./src/reports/ReportGenerator');
const PDFConverter = require('./src/reports/PDFConverter');
const fs = require('fs');
const path = require('path');

// 示例报告数据
const sampleData = {
  title: '2024年度市场分析报告',
  subtitle: '第四季度市场趋势与展望',
  sections: [
    {
      title: '执行摘要',
      description: '本报告分析了2024年第四季度的市场趋势，涵盖主要行业动态、竞争格局和未来预测。',
      tags: ['市场分析', '季度报告', '2024'],
      list: [
        '总体市场规模达到预期增长目标',
        '新兴技术领域保持强劲增长势头',
        '传统行业数字化转型加速'
      ]
    },
    {
      title: '行业概况',
      description: '主要行业表现分析',
      stats: [
        { value: '2.8万亿', label: '市场规模' },
        { value: '15.3%', label: '同比增长' },
        { value: '1,250', label: '新增企业' },
        { value: '87.5%', label: '市场渗透率' }
      ]
    },
    {
      title: '竞争格局',
      description: '主要竞争者市场份额',
      table: {
        headers: ['企业', '市场份额', '同比变化', '评级'],
        rows: [
          ['企业 A', '28.5%', '+2.3%', '★★★★★'],
          ['企业 B', '22.1%', '-1.5%', '★★★★☆'],
          ['企业 C', '18.7%', '+5.2%', '★★★★★'],
          ['企业 D', '12.3%', '+0.8%', '★★★☆☆'],
          ['其他', '18.4%', '-2.1%', '★★☆☆☆']
        ]
      }
    },
    {
      title: '发展趋势',
      description: '未来发展方向分析',
      cards: [
        {
          title: '技术创新',
          content: '人工智能和机器学习技术将继续推动行业变革，预计2025年技术投入将增长30%。'
        },
        {
          title: '绿色经济',
          content: '可持续发展将成为企业核心战略，环保相关产业预计实现45%的增长。'
        },
        {
          title: '全球化布局',
          content: '新兴市场将成为增长主要来源，跨境投资将持续活跃。'
        }
      ]
    },
    {
      title: '投资建议',
      description: '基于当前市场分析的投资建议',
      subsections: [
        {
          title: '短期策略',
          content: '建议关注波动性较大的细分市场，把握周期性机会。'
        },
        {
          title: '长期策略',
          content: '持续关注技术创新和绿色经济领域的投资机会。'
        },
        {
          title: '风险提示',
          content: '注意宏观经济不确定性、政策变化和竞争加剧带来的风险。'
        }
      ]
    }
  ]
};

// 测试不同风格的 PDF 转换
async function testPDFConversion() {
  console.log('========================================');
  console.log('PDF Converter Test - P2-F2');
  console.log('========================================\n');

  const outputDir = path.join(__dirname, 'reports', 'pdf');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 测试不同风格
  const styles = ['sports', 'entertainment', 'finance', 'politics', 'military'];

  for (const style of styles) {
    console.log(`Testing ${style} style...`);

    // 创建报告生成器
    const reportGen = new ReportGenerator({
      style: style,
      title: sampleData.title,
      subtitle: sampleData.subtitle,
      author: 'UI-TARS Analytics'
    });

    // 生成 HTML
    const html = reportGen.generate(sampleData);

    // 保存 HTML（可选）
    const htmlPath = path.join(outputDir, `${style}-report.html`);
    fs.writeFileSync(htmlPath, html);

    // 创建 PDF 转换器
    const pdfConverter = new PDFConverter({
      format: 'A4',
      landscape: false,
      printBackground: true,
      margin: {
        top: '20mm',
        bottom: '25mm',
        left: '20mm',
        right: '20mm'
      },
      displayHeaderFooter: true,
      headerTemplate: PDFConverter.createHeaderTemplate('UI-TARS Report', { fontSize: '10px' }),
      footerTemplate: PDFConverter.createFooterTemplate({ fontSize: '9px' })
    });

    // 转换为 PDF
    const pdfPath = path.join(outputDir, `${style}-report.pdf`);
    await pdfConverter.fromHTML(html, pdfPath);
    await pdfConverter.close();

    console.log(`  ✓ ${style} style PDF created: ${pdfPath}`);
  }

  // 测试带水印的 PDF
  console.log('\nTesting watermark feature...');
  const reportGenFinance = new ReportGenerator({
    style: 'finance',
    title: '机密报告',
    subtitle: '内部使用'
  });

  const htmlConfidential = reportGenFinance.generate({
    ...sampleData,
    title: '机密：2024年度市场分析报告',
    sections: [sampleData.sections[0]]
  });

  const pdfConverterWatermark = new PDFConverter({
    format: 'A4',
    watermark: {
      text: 'CONFIDENTIAL',
      opacity: 0.15,
      angle: -45
    }
  });

  const watermarkPath = path.join(outputDir, 'confidential-report.pdf');
  await pdfConverterWatermark.fromHTML(htmlConfidential, watermarkPath);
  await pdfConverterWatermark.close();

  console.log(`  ✓ Watermarked PDF created: ${watermarkPath}`);

  // 测试静态快速转换方法
  console.log('\nTesting static convert method...');
  const quickPath = path.join(outputDir, 'quick-report.pdf');
  await PDFConverter.convert(htmlConfidential, quickPath, {
    format: 'A4',
    printBackground: true
  });
  console.log(`  ✓ Quick convert PDF created: ${quickPath}`);

  // 测试页面格式支持
  console.log('\nSupported PDF formats:');
  console.log(PDFConverter.getSupportedFormats().join(', '));

  console.log('\n========================================');
  console.log('All PDF conversion tests passed!');
  console.log('========================================');
  console.log(`\nGenerated files in: ${outputDir}`);
}

// 运行测试
testPDFConversion().catch(console.error);
