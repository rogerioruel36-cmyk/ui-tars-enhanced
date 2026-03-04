/**
 * PPT Converter Test Script
 * 测试 P2-F3 PPT 转换器功能
 */

const PPTConverter = require('./src/reports/PPTConverter');
const path = require('path');

async function testPPTConverter() {
  console.log('=== PPT Converter Test ===\n');

  // 测试数据
  const testData = {
    slides: [
      // 标题页
      {
        type: 'title',
        title: 'UI-TARS 项目报告',
        subtitle: '2024年度总结与展望',
        author: 'UI-TARS Team'
      },
      // 内容页 - 项目概述
      {
        type: 'content',
        title: '项目概述',
        content: [
          'UI-TARS 是一个多功能的 AI Agent 工作流平台',
          '支持浏览器自动化、报告生成、文件转换等功能',
          { text: '本报告展示 PPT 转换器的核心功能', bullet: true },
          { text: '支持多种主题和布局', bullet: true }
        ]
      },
      // 双栏内容页
      {
        type: 'two-column',
        title: '功能特点',
        left: {
          title: '核心功能',
          content: '浏览器自动化\n工作流引擎\n技能系统\n报告生成'
        },
        right: {
          title: '技术优势',
          content: '模块化架构\n高扩展性\n多主题支持\nPDF/PPT 导出'
        }
      },
      // 图表页
      {
        type: 'chart',
        title: '季度性能统计',
        chartType: 'bar',
        chart: [
          { labels: ['Q1', 'Q2', 'Q3', 'Q4'] },
          { name: '完成任务', values: [45, 62, 78, 95] },
          { name: '用户增长', values: [120, 180, 250, 320] }
        ],
        xAxisTitle: '季度',
        yAxisTitle: '数量'
      },
      // 表格页
      {
        type: 'table',
        title: '功能对比',
        table: {
          headers: ['功能', '基础版', '专业版', '企业版'],
          rows: [
            ['浏览器自动化', '✓', '✓', '✓'],
            ['工作流引擎', '✓', '✓', '✓'],
            ['PDF 导出', '✓', '✓', '✓'],
            ['PPT 导出', '—', '✓', '✓'],
            ['自定义主题', '—', '✓', '✓'],
            ['API 接口', '—', '—', '✓']
          ]
        }
      },
      // 内容页 - 总结
      {
        type: 'content',
        title: '总结与展望',
        content: [
          '✓ 已完成核心功能的开发',
          '✓ 支持多种主题和布局',
          '✓ 支持图表和表格插入',
          '下一步计划：',
          { text: '完善 HTML 解析功能', bullet: true, indent: 1 },
          { text: '添加更多图表类型', bullet: true, indent: 1 },
          { text: '优化图片处理', bullet: true, indent: 1 }
        ]
      }
    ]
  };

  const outputDir = path.join(__dirname, 'reports', 'ppt');
  const outputPath = path.join(outputDir, 'test-report.pptx');

  try {
    // 使用不同主题生成 PPT
    console.log('1. Testing default theme...');
    await PPTConverter.convert(testData, outputPath);
    console.log(`   ✓ Default theme: ${outputPath}`);

    // 测试主题变体
    const themes = ['sports', 'entertainment', 'finance', 'politics', 'military'];
    for (const theme of themes) {
      const themedPath = path.join(outputDir, `test-${theme}.pptx`);
      await PPTConverter.convert(testData, themedPath, { theme });
      console.log(`   ✓ ${theme} theme: ${themedPath}`);
    }

    // 测试 HTML 转换
    console.log('\n2. Testing HTML conversion...');
    const html = `
      <html>
        <body>
          <h1>测试报告</h1>
          <p>这是一个测试段落</p>
          <p>用于验证 HTML 到 PPT 的转换功能</p>
        </body>
      </html>
    `;
    const htmlOutputPath = path.join(outputDir, 'test-html.pptx');
    await PPTConverter.convertHTML(html, htmlOutputPath);
    console.log(`   ✓ HTML conversion: ${htmlOutputPath}`);

    // 测试支持的类型
    console.log('\n3. Supported themes:', PPTConverter.getSupportedThemes().map(t => t.id).join(', '));
    console.log('4. Supported slide types:', PPTConverter.getSupportedSlideTypes().map(t => t.id).join(', '));

    console.log('\n=== All Tests Passed ===');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

testPPTConverter();
