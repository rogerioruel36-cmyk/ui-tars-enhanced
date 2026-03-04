/**
 * Test file for Multi-Style HTML Report Generator
 * P2-F1: 多风格 HTML 报告生成器
 */

const ReportGenerator = require('./src/reports/ReportGenerator');
const path = require('path');
const fs = require('fs');

// Sample report data
const sampleData = {
  sections: [
    {
      title: '执行摘要',
      description: '本报告分析了2026年第一季度全球市场趋势。',
      tags: ['市场分析', '2026Q1', '全球视角'],
      subsections: [
        {
          title: '关键发现',
          content: '本季度全球市场呈现稳健增长态势，多个行业实现突破性进展。'
        }
      ]
    },
    {
      title: '核心指标',
      stats: [
        { value: '15.8%', label: '增长率' },
        { value: '$2.4T', label: '总市值' },
        { value: '1,240', label: '新增企业' },
        { value: '89.2%', label: '满意度' }
      ]
    },
    {
      title: '行业分析',
      description: '各行业表现详情',
      cards: [
        { title: '技术创新', content: '人工智能和机器学习领域持续领跑，带来前所未有的行业变革。' },
        { title: '绿色能源', content: '可再生能源项目投资增长显著，太阳能和风能成为投资热点。' },
        { title: '医疗健康', content: '远程医疗和数字健康解决方案需求激增，市场规模扩大。' },
        { title: '金融服务', content: '数字化转型加速，区块链技术应用范围不断扩大。' }
      ]
    },
    {
      title: '数据统计',
      table: {
        headers: ['行业', '增长率', '投资额', '趋势'],
        rows: [
          ['科技', '+24.5%', '$850B', '↑ 上升'],
          ['能源', '+18.2%', '$420B', '↑ 上升'],
          ['医疗', '+15.7%', '$380B', '→ 平稳'],
          ['金融', '+12.3%', '$290B', '→ 平稳'],
          ['制造', '+8.9%', '$210B', '↓ 下降']
        ]
      }
    },
    {
      title: '未来展望',
      description: '基于当前数据分析，预测下一季度趋势',
      list: [
        '技术创新将继续驱动市场增长',
        '绿色能源投资将持续增加',
        '数字化转型将进一步加速',
        '全球化布局将带来新机遇'
      ]
    }
  ]
};

// Test function
async function testAllStyles() {
  const styles = ['sports', 'entertainment', 'finance', 'politics', 'military'];
  const reportsDir = path.join(__dirname, 'reports');

  console.log('========================================');
  console.log('Multi-Style HTML Report Generator Test');
  console.log('========================================\n');

  for (const style of styles) {
    console.log(`Testing ${style} style...`);

    const generator = ReportGenerator.create(style, {
      title: `${style.toUpperCase()} Style Report`,
      subtitle: 'Sample Report for Testing',
      author: 'UI-TARS Test'
    });

    const outputPath = path.join(reportsDir, `test-${style}-report.html`);
    await generator.save(sampleData, outputPath);

    console.log(`  ✓ Generated: reports/test-${style}-report.html`);
  }

  // Test custom style
  console.log('\nTesting custom style...');
  const customGenerator = ReportGenerator.createWithCustomStyle({
    name: 'Custom Blue',
    primary: '#0066CC',
    secondary: '#003366',
    accent: '#00FFCC',
    background: 'linear-gradient(135deg, #001a33 0%, #003366 100%)',
    cardBg: '#002244',
    text: '#E6F2FF',
    textMuted: '#99CCFF',
    border: '#0066CC',
    headerGradient: 'linear-gradient(135deg, #0066CC 0%, #003366 100%)'
  }, {
    title: 'Custom Style Report',
    subtitle: 'Blue Theme Custom Style',
    author: 'UI-TARS Test'
  });

  const customPath = path.join(reportsDir, 'test-custom-report.html');
  await customGenerator.save(sampleData, customPath);
  console.log(`  ✓ Generated: reports/test-custom-report.html`);

  // Print available styles
  console.log('\n========================================');
  console.log('Available Styles:');
  console.log('========================================');
  ReportGenerator.getAvailableStyles().forEach(s => {
    console.log(`  - ${s.id}: ${s.name}`);
  });

  console.log('\n========================================');
  console.log('All tests passed!');
  console.log('========================================');
}

// Run tests
testAllStyles().catch(console.error);
