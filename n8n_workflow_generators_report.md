# GitHub 开源项目：自然语言生成 n8n Workflow JSON 方案

本报告汇总了 GitHub 上至少 5 个根据自然语言自动生成 n8n workflow JSON 并可导入 n8n 的开源方案，包含详细的项目链接、功能特性和限制说明。

---

## 1. n8n Workflow AI Generator (Chrome Extension)

**项目链接**: https://github.com/mehrdaddjavadi/workflow-ai-generator

**Stars**: 1 | **语言**: JavaScript | **最后更新**: 2025-12-31

### 功能特性

这是一个强大的 Chrome 扩展程序，利用 AI 即时生成 n8n workflow 和节点 JSON 配置。用户只需用自然语言描述需求，扩展就能生成生产就绪的 JSON 输出。

主要特性包括：

- **多 AI 支持**: 支持 OpenAI GPT、Google Gemini、Anthropic Claude、Deepseek、Mistral AI、OpenRouter、Groq、x.ai (Grok) 以及本地 LLM (Ollama)
- **自带密钥**: 使用现有的 API 额度，无需为扩展支付订阅费用
- **安全隐私**: 所有 API 密钥仅存储在浏览器本地存储中，不与第三方共享
- **即时生成**: 将自然语言描述转换为有效的 n8n JSON，仅需数秒
- **生成历史**: 跟踪所有之前的生成记录，便于参考和重用
- **灵活显示模式**: 支持弹出窗口和侧面板两种工作模式

### 限制

- 仅支持 Chrome 浏览器
- 依赖外部 AI 提供商的 API，需要用户自行配置 API 密钥
- 生成质量取决于所选 LLM 的能力
- 不支持实时验证生成的 JSON 是否完全符合 n8n 最新版本的规范

---

## 2. n8n Workflow Studio (Multi-LLM Generator)

**项目链接**: https://github.com/turtir-ai/n8n-workflow-studio

**Stars**: 0 | **语言**: TypeScript | **最后更新**: 2026-02-13

### 功能特性

这是一个基于 Next.js 16 和 Monaco Editor 的多 LLM 驱动的 n8n workflow 生成器、验证器和修复工具。它能从自然语言描述生成生产就绪的 workflow JSON。

核心功能包括：

- **多 LLM 支持**: 支持 z.ai Gateway (GLM-5, GLM-4.7)、OpenAI (GPT-4o, GPT-4-turbo, GPT-3.5)、Google Gemini (Gemini 2.0 Flash, Gemini 1.5 Pro)、OpenRouter (500+ 模型)、Groq (Llama 3.3, Mixtral) 以及本地 GLM-5
- **Workflow 操作**: 生成、验证、修复和增强 workflow
- **Skills 系统**: 通过意图检测、模式匹配、最佳实践注入、复杂度估计和集成检测来增强提示
- **开发者体验**: 实时 Monaco Editor、并排 diff 查看器、操作历史跟踪、响应式设计
- **BYOK 模式**: API 密钥永不离开浏览器

### 限制

- 需要 Node.js 环境和 npm 依赖
- 本地 GLM-5 支持需要额外的 FastAPI 桥接配置
- 验证系统虽然多阶段，但仍可能无法捕获所有边界情况
- 修复功能依赖 LLM 的推理能力，复杂问题可能需要手动干预

---

## 3. n8n AI Agent Workflow Generator (Gemini-Powered)

**项目链接**: https://github.com/chienchitung/n8n-ai-agent-workflow-generator

**Stars**: 0 | **语言**: TypeScript | **最后更新**: 2025-10-04

### 功能特性

这是一个由 Gemini API 驱动的应用程序，根据用户需求生成 n8n workflow JSON 和设置说明。

主要特性：

- **Gemini API 集成**: 利用 Google 的 Gemini 模型进行自然语言理解和 JSON 生成
- **完整设置说明**: 不仅生成 workflow JSON，还提供详细的设置和配置说明
- **用户需求驱动**: 根据用户的具体需求定制 workflow 生成

### 限制

- 仅支持 Gemini API，不支持其他 LLM 提供商
- 需要有效的 Gemini API 密钥
- 项目文档相对简洁，可能需要额外的学习成本
- 生成的 workflow 复杂度可能受 Gemini 上下文窗口限制

---

## 4. AI-Powered Workflow Template Generator (Python)

**项目链接**: https://github.com/8shanrahan2/ai-workflow-template-generator

**Stars**: 0 | **语言**: Python | **最后更新**: 2025-07-19

### 功能特性

这是一个精心设计的 Python 控制台应用程序，将自然语言描述转换为 JSON workflow 模板。由 Google Gemini AI 驱动，具有智能回退和全面的验证。

核心功能：

- **AI 驱动**: 使用 Google Gemini 进行自然语言理解
- **智能回退**: 离线工作时具有智能模拟响应
- **数据验证**: Pydantic 模型确保完美的 JSON 输出
- **美观 CLI**: Rich 控制台界面，具有颜色和格式化
- **RAG 系统**: 从示例中学习以改进响应
- **生产就绪**: 全面的错误处理和弹性设计

### 限制

- 仅支持 Python 3.8+
- 主要针对监控手机会话数据事件的 workflow，通用性可能有限
- 需要 Gemini API 密钥才能获得最佳性能
- RAG 系统依赖 ChromaDB，可能存在依赖冲突

---

## 5. n8n Workflow Builder MCP (Model Context Protocol)

**项目链接**: https://github.com/ifmelate/n8n-workflow-builder-mcp

**Stars**: 49 | **语言**: JavaScript | **最后更新**: 2026-01-31

### 功能特性

这是一个 Model Context Protocol (MCP) 服务器，允许 LLM 在代理模式下为用户构建 n8n workflow。它与 Cursor IDE、Claude、ChatGPT 等 AI 工具集成。

主要特性：

- **Workflow 管理**: 以编程方式创建、更新和执行 n8n workflow
- **节点发现**: 探索可用的 n8n 节点及其功能
- **连接管理**: 创建 workflow 节点之间的连接
- **AI 集成**: 专门用于在 workflow 中连接 AI 组件的工具
- **AI 友好接口**: 专为与 AI 代理交互而设计
- **N8N 版本管理**: 自动版本检测和兼容性处理，支持 123+ N8N 版本

### 限制

- 需要 Node.js v14 或更高版本
- 需要 Cursor IDE v0.48 或更新版本
- 有时 LLM 代理会在请求中放置错误的参数，需要手动修复
- 并非所有节点类型都经过测试验证
- 需要配置 n8n API URL 和 API 密钥

---

## 6. n8n Agent (LLM-Based Workflow Generator)

**项目链接**: https://github.com/kingler/n8n_agent

**Stars**: 225 | **语言**: JavaScript | **最后更新**: 2026-02-24

### 功能特性

这是一个基于 LLM 的 AI 代理，可从单个文本提示生成 n8n 代理自动化 workflow。它是目前 GitHub 上星数最多的相关项目。

主要特性：

- **单提示生成**: 从一个自然语言提示生成完整的 n8n workflow
- **代理工作流**: 专门针对 n8n 代理自动化的优化
- **MCP 集成**: 包含 QDRANT、Neo4j 和 Supabase 的 MCP 集成
- **Workflow 验证**: 内置 workflow 验证工具，检查最佳实践
- **导入工具**: 直接将生成的 workflow 导入到 n8n 实例
- **Workflow 分析**: 提取元数据、生成描述、标签和复杂度分析

### 限制

- 需要配置多个数据库 (QDRANT、Neo4j、Supabase) 以获得完整功能
- 项目文档主要关注向量化和知识图谱，自然语言生成部分文档较少
- 需要 OpenAI API 密钥用于嵌入和向量化
- 设置和配置相对复杂，需要一定的技术背景

---

## 7. n8n Workflows Maker (Terminal Agent)

**项目链接**: https://github.com/jorgevz/n8n-workflows-maker

**Stars**: 49 | **语言**: 未指定 | **最后更新**: 2026-02-24

### 功能特性

这是一个终端代理工具，结合提示生成可直接导入 n8n 的 workflow JSON 文件。

主要特性：

- **终端界面**: 命令行工具，易于集成到自动化脚本
- **提示驱动**: 使用自然语言提示生成 workflow
- **直接导入**: 生成的 JSON 可直接导入到 n8n

### 限制

- 项目文档有限，README 可能不完整
- 缺乏详细的功能说明和使用示例
- 不清楚支持的 LLM 提供商和功能范围
- 项目活跃度和维护状态需要进一步确认

---

## 比较总结

| 项目 | 类型 | 主要 LLM | 星数 | 最新更新 | 易用性 | 功能完整性 |
|------|------|---------|------|---------|--------|-----------|
| Workflow AI Generator | Chrome 扩展 | 多个 | 1 | 2025-12-31 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| n8n Workflow Studio | Web 应用 | 多个 | 0 | 2026-02-13 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| n8n AI Agent Generator | Web 应用 | Gemini | 0 | 2025-10-04 | ⭐⭐⭐ | ⭐⭐⭐ |
| AI Workflow Template Gen | Python CLI | Gemini | 0 | 2025-07-19 | ⭐⭐⭐ | ⭐⭐⭐ |
| n8n Workflow Builder MCP | MCP 服务器 | 多个 | 49 | 2026-01-31 | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| n8n Agent | Node.js | 多个 | 225 | 2026-02-24 | ⭐⭐ | ⭐⭐⭐⭐ |
| n8n Workflows Maker | 终端工具 | 未知 | 49 | 2026-02-24 | ⭐⭐ | ⭐⭐ |

---

## 推荐使用场景

**快速开始**: 使用 Workflow AI Generator Chrome 扩展，支持多个 LLM，最易上手。

**功能最完整**: 选择 n8n Workflow Studio，提供生成、验证、修复等完整功能。

**IDE 集成**: 如果使用 Cursor IDE，选择 n8n Workflow Builder MCP 获得最佳集成体验。

**Python 环境**: 如果偏好 Python，选择 AI-Powered Workflow Template Generator。

**高级功能**: 如果需要向量化搜索和知识图谱，选择 n8n Agent。

---

## 总结

这七个开源项目提供了多种方式将自然语言转换为 n8n workflow JSON。从简单的 Chrome 扩展到复杂的 MCP 服务器，每个项目都有其独特的优势和限制。选择哪个项目取决于你的具体需求、技术栈和使用场景。
