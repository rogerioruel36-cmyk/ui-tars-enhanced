# 深色数据报告页面 · 通用提示词模板

## Jarvis 执行规则

收到"生成/做/帮我做 HTML 报告/页面"类请求时：

1. 从用户描述中**自动提取**：
   - TOPIC：报告主题，1句话概括
   - SECTIONS：根据主题自动规划 3~8 个逻辑递进的章节
   - DATA：整理用户提供的所有数据和内容；若用户未提供数据，自动生成合理示例数据并在页面底部标注"部分数据为示例"

2. 将提取结果**直接填入下方提示词**，发给模型生成 HTML，无需询问用户确认。

3. 用户说"简单版"或指定其他风格时，跳过本模板。

---

## 提示词正文（发给模型时使用）

```
请用纯 HTML 单文件生成一个深色主题数据报告页面。

主题：{从用户描述中提取的 TOPIC}

章节规划：{根据主题自动规划的 SECTIONS，3~8个，逻辑递进}

内容与数据：{从用户描述中整理的 DATA，包含所有数字、事件、图表数据}

---

## 技术栈（全部用 CDN）
- Tailwind CSS
- GSAP + ScrollTrigger
- ECharts
- Phosphor Icons
- Google Fonts：Noto Serif SC + Noto Sans SC + JetBrains Mono
- Leaflet（仅当内容涉及地理数据时引入，否则不加载）

## 配色体系
- 页面背景：#0a0e1a
- 卡片背景：linear-gradient(145deg, rgba(20,28,48,0.9), rgba(15,22,40,0.95))
- 主强调色：#e84118 / #ff6b35（危险/重点）
- 次强调色：#f5a623（警示/数据标注）
- 正向色：#2ed8a3（增长/好消息）
- 信息色：#6495ed（中性数据）
- 正文色：#e2e8f0
- 次级文字：rgba(255,255,255,0.5)
- 边框：rgba(255,255,255,0.06~0.1)

## 字体规则
- 大标题：Noto Serif SC，700~900
- 正文：Noto Sans SC，300~400
- 数字/标签/坐标轴：JetBrains Mono
- section-label：JetBrains Mono，0.7rem，letter-spacing 0.3em，uppercase，color #f5a623

## 页面结构

**1. 顶部进度条**
fixed，高3px，渐变 #e84118→#f5a623→#2ed8a3，随滚动填充宽度。

**2. 悬浮导航胶囊**
fixed 居中，backdrop-filter blur(20px)，圆角胶囊，含各 section 锚点。

**3. Hero 全屏**
- 背景：径向渐变光晕 + 网格线（opacity 0.04）
- 内容：section-label → 主标题（第二行渐变色）→ 副标题 → 日期/数据截止时间
- GSAP 各元素依次延迟入场（0.3/0.5/0.8/1.1s）
- 底部 bounce 向下箭头

**4. 核心数据速览**
4列×2行网格，每格 glow-card：stat-number 大数字（渐变色，JetBrains Mono）+ 指标名 + 备注小字。

**5. 主体 Sections**
按章节规划逐一生成，每个 section 结构：
- section-label 小标签（序号 / 名称）
- h2 大标题
- 说明段落
- 图表 / 卡片 / 列表（根据内容类型选择）

**6. ECharts 图表规范**
- 背景透明
- 坐标轴线 rgba(255,255,255,0.1)，无刻度
- 轴标签 rgba(255,255,255,0.5)，Noto Sans SC，11px
- 分割线 rgba(255,255,255,0.04)
- Tooltip：自定义深色卡片（背景 rgba(10,14,26,0.95)，橙红边框，圆角8px）
- 面积图用 LinearGradient 渐变填充
- 柱状图圆角 [6,6,0,0] 或 [0,4,4,0]

**7. glow-card 样式**
background: linear-gradient(145deg, rgba(20,28,48,0.9), rgba(15,22,40,0.95));
border: 1px solid rgba(255,255,255,0.06);
border-radius: 16px;
overflow: hidden;
::before 顶部 2px 渐变线：transparent → #e84118 → transparent

**8. 滚动动效**
所有主要元素加 .fade-in（初始 opacity:0, translateY:40px），GSAP ScrollTrigger 进入视口触发（0.8s，power2.out，once:true）。

**9. Footer**
数据来源 + 报告时间 + 免责声明，极小灰色字，顶部细分割线。

**10. 其他**
- 单文件，CSS/JS 全部内联
- window.resize 时所有 chart.resize()
- 滚动条：细，深色，hover 变橙红
- body::before 噪点纹理（pointer-events:none，opacity 0.03）
- 移动端响应式：图表高度缩减，多列网格降为单列/双列
```

---

## 变体索引

| 风格名 | 文件 | 适用场景 |
|---|---|---|
| 深色数据报告（默认） | `dark-report-template.md` | 调研报告、市场分析、数据可视化 |
| （待添加） | — | 金融大屏、产品发布、学术报告… |
