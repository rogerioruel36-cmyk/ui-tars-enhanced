# GitHub AI自动生成PPT/PDF方案调研报告

基于实际访问GitHub仓库获取的信息，以下是8个支持AI自动生成演示文稿的优质开源项目。

---

## 1. banana-slides

**仓库名称**: banana-slides  
**GitHub链接**: https://github.com/Anionex/banana-slides  
**Stars**: 12,466 ⭐

**技术栈**: TypeScript, React, Node.js, Nano Banana Pro API

**功能支持**:
- ✅ PPT生成: 完全支持
- ❌ PDF生成: 不支持
- ✅ 图表支持: 支持
- ✅ 背景图片: 支持

**核心特性**: 基于nano banana pro的原生AI PPT生成应用，支持上传任意模板图片、素材智能解析、一句话或大纲生成演示文稿。提供在线Demo和完整文档。支持Docker部署，版本v0.4.0。

**成熟度评价**: ⭐⭐⭐⭐⭐ 非常成熟。Star数最高，社区活跃度高，有完整的在线演示和文档支持。适合生产环境使用。

---

## 2. PPTAgent

**仓库名称**: PPTAgent  
**GitHub链接**: https://github.com/icip-cas/PPTAgent  
**Stars**: 3,413 ⭐

**技术栈**: Python, LLM, MCP (Model Context Protocol), PptxGenJS, Playwright, Sharp

**功能支持**:
- ✅ PPT生成: 完全支持
- ❌ PDF生成: 不支持
- ✅ 图表支持: 支持
- ✅ 背景图片: 支持

**核心特性**: 反思性PowerPoint生成的Agent框架，采用多Agent协作架构。支持多轮对话优化演示文稿，能够根据反馈进行迭代改进。支持多语言（英文、中文、日文、韩文等）。集成MCP协议，可与各类LLM模型集成。

**成熟度评价**: ⭐⭐⭐⭐ 成熟。来自中科院，学术背景强，架构设计先进。代码质量高，文档完整。适合需要高级Agent功能的场景。

---

## 3. python-pptx

**仓库名称**: python-pptx  
**GitHub链接**: https://github.com/scanny/python-pptx  
**Stars**: 3,197 ⭐

**技术栈**: Python, Open XML

**功能支持**:
- ✅ PPT生成: 完全支持
- ❌ PDF生成: 不支持
- ✅ 图表支持: 支持
- ✅ 背景图片: 支持

**核心特性**: 在Python中创建和修改Open XML PowerPoint文档的基础库。是许多PPT生成项目的底层依赖。提供完整的API用于创建幻灯片、添加形状、文本、图表、图片等。支持模板和主题。

**成熟度评价**: ⭐⭐⭐⭐⭐ 非常成熟。这是Python生态中最稳定的PPT库，被广泛使用。文档完善，更新频繁。是构建PPT生成系统的最佳基础库。

---

## 4. presentation-ai

**仓库名称**: presentation-ai  
**GitHub链接**: https://github.com/allweonedev/presentation-ai  
**Stars**: 2,567 ⭐

**技术栈**: TypeScript, React, Next.js, Tailwind CSS, Plate.js, Prisma, AI SDK (OpenAI/兼容)

**功能支持**:
- ✅ PPT生成: 完全支持
- ✅ PDF生成: 支持
- ✅ 图表支持: 支持
- ✅ 背景图片: 支持

**核心特性**: ALLWEONE开源AI演示文稿生成器，是Gamma.app的开源替代品。支持自定义主题、本地模型支持、完整的编辑功能。提供在线Demo和视频教程。支持创建、编辑、导出演示文稿。具有完整的数据库支持（Prisma）。

**成熟度评价**: ⭐⭐⭐⭐ 成熟。功能最完整，同时支持PPT和PDF导出。社区活跃，有Discord社区支持。适合需要全功能演示文稿生成平台的用户。

---

## 5. Office-PowerPoint-MCP-Server

**仓库名称**: Office-PowerPoint-MCP-Server  
**GitHub链接**: https://github.com/GongRzhe/Office-PowerPoint-MCP-Server  
**Stars**: 1,546 ⭐

**技术栈**: Python, MCP (Model Context Protocol), python-pptx, 32个专业工具模块

**功能支持**:
- ✅ PPT生成: 完全支持
- ❌ PDF生成: 不支持
- ✅ 图表支持: 支持
- ✅ 背景图片: 支持

**核心特性**: 全面的MCP服务器，提供32个强大工具组织成11个专业模块。支持完整的PowerPoint创建、管理和专业设计功能。模块化架构，参数处理智能，错误处理完善。支持模板、主题、布局保留。支持多演示文稿管理。

**成熟度评价**: ⭐⭐⭐⭐ 成熟。Version 2.0提供了显著改进。功能最全面，工具数量最多。特别适合与AI模型集成的场景。代码质量高。

---

## 6. SlideBot-AI

**仓库名称**: SlideBot-AI  
**GitHub链接**: https://github.com/tonyqinatcmu/SlideBot-AI  
**Stars**: 657 ⭐

**技术栈**: JavaScript/TypeScript, React, Python, FastAPI, 企业级架构

**功能支持**:
- ✅ PPT生成: 完全支持
- ❌ PDF生成: 不支持
- ✅ 图表支持: 支持
- ✅ 背景图片: 支持

**核心特性**: 智能演示文稿生成平台，源自真实商业场景，经过企业级用户打磨验证。支持上传参考文档、插入图表素材、素材描述功能。2025年新增功能：图片自动压缩为JPEG（质量85%），文件体积减少60%以上。支持每页主旨设置、大纲预览编辑、图片微调模式。提供在线体验版本。

**成熟度评价**: ⭐⭐⭐ 中等偏上。功能实用，持续更新。来自真实商业应用，经过用户验证。适合需要实用功能和持续改进的场景。

---

## 7. Auto-Slides

**仓库名称**: Auto-Slides  
**GitHub链接**: https://github.com/Westlake-AGI-Lab/Auto-Slides  
**Stars**: 426 ⭐

**技术栈**: Python, LLM, Multi-Agent Collaboration, 认知科学原理

**功能支持**:
- ✅ PPT生成: 完全支持
- ❌ PDF生成: 不支持
- ✅ 图表支持: 支持
- ✅ 背景图片: 支持

**核心特性**: 自动学术演示文稿生成系统，将学术研究论文转换为结构良好、教学优化的演示幻灯片。基于大语言模型和认知科学原理。创建多模态演示文稿，具有交互式定制功能。有项目页面和ArXiv论文支持。

**成熟度评价**: ⭐⭐⭐ 中等。学术背景强，针对学术内容优化。功能专业但相对专一。适合学术演示文稿生成场景。

---

## 8. pptx-automizer

**仓库名称**: pptx-automizer  
**GitHub链接**: https://github.com/singerla/pptx-automizer  
**Stars**: 157 ⭐

**技术栈**: TypeScript, Node.js, PptxGenJS, xmldom, JSZip

**功能支持**:
- ✅ PPT生成: 完全支持
- ❌ PDF生成: 不支持
- ✅ 图表支持: 支持（通过PptxGenJS）
- ✅ 背景图片: 支持

**核心特性**: 基于模板的Node.js PPTX生成器，自动化现有.pptx文件的操作。支持导入模板库、合并模板、自定义幻灯片内容。可通过xmldom回调修改大部分内容。集成PptxGenJS用于从零创建元素。特别适合管理自定义布局库的用户。

**成熟度评价**: ⭐⭐ 初期。功能相对基础，社区规模较小。适合需要模板化PPT生成的开发者。

---

## 总体对比分析

### 功能完整性排名
1. **presentation-ai** - 唯一同时支持PPT和PDF的完整方案
2. **PPTAgent** - Agent框架最先进
3. **Office-PowerPoint-MCP-Server** - 工具数量最多（32个）
4. **banana-slides** - 用户体验最好
5. **SlideBot-AI** - 功能最实用

### 成熟度排名
1. **python-pptx** - 最稳定的基础库
2. **banana-slides** - Star数最高，社区最活跃
3. **PPTAgent** - 学术背景强
4. **presentation-ai** - 功能最完整
5. **Office-PowerPoint-MCP-Server** - 工具最全面

### 技术栈分布
- **Python方案**: PPTAgent, python-pptx, Office-PowerPoint-MCP-Server, Auto-Slides, SlideBot-AI（后端）
- **TypeScript/Node.js方案**: banana-slides, presentation-ai, pptx-automizer, SlideBot-AI（前端）

### 推荐使用场景

**生产环境首选**: presentation-ai（功能完整）或 banana-slides（用户体验最好）

**开发集成首选**: python-pptx（基础库）或 Office-PowerPoint-MCP-Server（MCP集成）

**学术应用首选**: Auto-Slides（针对论文优化）

**企业应用首选**: SlideBot-AI（经过商业验证）

**Agent应用首选**: PPTAgent（多Agent协作）

---

## 关键发现

1. **PDF支持稀缺**: 在8个项目中，仅有presentation-ai同时支持PPT和PDF生成，这是一个明显的功能缺口。

2. **图表和背景图片**: 所有8个项目都支持图表和背景图片功能，这已成为标准配置。

3. **技术栈多样化**: Python和TypeScript/Node.js各占一半，反映了不同应用场景的需求。

4. **MCP协议兴起**: PPTAgent和Office-PowerPoint-MCP-Server都采用MCP协议，这是与AI模型集成的新趋势。

5. **持续活跃**: 大多数项目在2025年仍有更新，表明这个领域保持活跃。

---

*报告生成时间: 2026年3月2日*  
*数据来源: GitHub API和仓库README文件*
