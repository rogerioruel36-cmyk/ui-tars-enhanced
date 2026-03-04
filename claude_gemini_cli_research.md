# Claude Code 和 Gemini CLI 命令行参数调研报告

## 执行摘要

本报告对 Claude Code 和 Google Gemini 的命令行工具进行了深入调研。调研发现 Anthropic 目前没有官方的 Claude Code CLI 工具，而 Google 提供了 google-genai SDK。两者都有丰富的第三方 CLI 实现，支持通过命令行直接输入 prompt 并获取 AI 响应。

---

## 一、Claude Code CLI 调研

### 1.1 官方工具现状

Anthropic 目前**没有发布官方的 Claude Code CLI 工具**。Claude Code 是一个集成在 Claude.ai 网页界面中的功能，主要用于代码生成和编辑。用户可以通过以下方式使用 Claude：

- **Web 界面**：访问 claude.ai 使用 Claude Code
- **Python SDK**：使用 anthropic 包进行编程调用
- **API**：通过 REST API 调用 Claude 模型

### 1.2 第三方 Claude Code CLI 工具

基于 GitHub 搜索，发现了多个社区开发的 Claude Code CLI 工具：

#### 1.2.1 主要项目

**claude-engineer** (Doriandarko/claude-engineer)
- 星数：11,169
- 描述：交互式命令行界面，利用 Claude-3.5-Sonnet 模型
- 特点：支持 CLI 和现代 Web 界面
- 用途：软件开发任务辅助
- GitHub：https://github.com/Doriandarko/claude-engineer

**gpt-cli** (kharvd/gpt-cli)
- 星数：724
- 支持：ChatGPT、Claude 和 Bard
- 功能：统一的命令行接口用于多个 AI 模型
- GitHub：https://github.com/kharvd/gpt-cli

**claude-code-templates** (davila7/claude-code-templates)
- 星数：21,743
- 描述：用于配置和监控 Claude Code 的 CLI 工具
- 特点：提供代码模板和配置管理
- GitHub：https://github.com/davila7/claude-code-templates

**claude-code-tools** (pchalasani/claude-code-tools)
- 星数：1,509
- 描述：Claude Code 的实用生产力工具
- 特点：支持 Claude Code、Codex-CLI 和类似的 CLI 编码代理
- GitHub：https://github.com/pchalasani/claude-code-tools

**CCPlugins** (brennercruvinel/CCPlugins)
- 星数：2,676
- 描述：最好的 Claude Code 框架，节省时间
- 特点：提供预配置的插件和命令
- GitHub：https://github.com/brennercruvinel/CCPlugins

#### 1.2.2 其他相关工具

- **claude-scholar**：学术研究和软件开发的 AI CLI 配置
- **claude-skills**：Claude Code CLI 的技能扩展
- **claude-oracle**：使用 Google Gemini 作为 Claude Code 的架构师
- **mini_agent**：类似于 Claude Code 和 Gemini CLI 的迷你 AI 代理

### 1.3 Claude Code CLI 常见参数模式

基于开源项目分析，Claude Code CLI 工具通常支持以下参数：

```bash
# 基本用法
claude-code <prompt>
claude-code --prompt "your prompt here"
claude-code -p "your prompt"

# 常见参数
--model <model-name>          # 指定模型（如 claude-3-5-sonnet）
--temperature <value>         # 温度参数 (0-1)，控制输出随机性
--max-tokens <number>         # 最大令牌数，限制输出长度
--system <system-prompt>      # 系统提示，定义 AI 行为
--file <filepath>             # 输入文件路径
--output <filepath>           # 输出文件路径
--interactive / -i            # 交互模式
--verbose / -v                # 详细输出
--help / -h                   # 帮助信息
--api-key <key>              # API 密钥
--timeout <seconds>          # 超时时间
```

### 1.4 Claude Python SDK 使用示例

```python
import os
from anthropic import Anthropic

# 初始化客户端
client = Anthropic(
    api_key=os.environ.get("ANTHROPIC_API_KEY")
)

# 基本调用
message = client.messages.create(
    model="claude-opus-4-6",
    max_tokens=1024,
    messages=[
        {
            "role": "user",
            "content": "你的提示词"
        }
    ]
)

print(message.content[0].text)
```

### 1.5 Claude Code CLI 实际使用示例

```bash
# 基本提示
claude-code "写一个 Python 函数来计算斐波那契数列"

# 指定模型和参数
claude-code --model claude-3-5-sonnet \
            --temperature 0.7 \
            --max-tokens 2000 \
            "你的提示词"

# 交互模式
claude-code -i

# 从文件读取提示
claude-code --file prompt.txt --output result.md

# 指定系统提示
claude-code --system "你是一个资深的 Python 开发者" \
            "写一个高效的排序算法"
```

---

## 二、Gemini CLI 调研

### 2.1 官方工具

Google 提供了**新的 Google Gen AI SDK**（google-genai），这是官方推荐的工具，替代了旧的 google-generative-ai 包。

### 2.2 安装和配置

#### 2.2.1 安装

```bash
# 使用 pip 安装
pip install google-genai

# 或使用 uv
uv pip install google-genai
```

#### 2.2.2 环境变量配置

```bash
# Gemini Developer API
export GEMINI_API_KEY='your-api-key'
# 或
export GOOGLE_API_KEY='your-api-key'

# Vertex AI（Google Cloud）
export GOOGLE_GENAI_USE_VERTEXAI=true
export GOOGLE_CLOUD_PROJECT='your-project-id'
export GOOGLE_CLOUD_LOCATION='us-central1'
```

### 2.3 Gemini SDK 基本使用

#### 2.3.1 基本调用

```python
from google import genai

# 创建客户端
client = genai.Client(api_key='YOUR_API_KEY')

# 生成内容
response = client.models.generate_content(
    model='gemini-2.5-flash',
    contents='你的提示词'
)

print(response.text)
```

#### 2.3.2 使用配置参数

```python
from google import genai
from google.genai import types

client = genai.Client(api_key='YOUR_API_KEY')

response = client.models.generate_content(
    model='gemini-2.5-flash',
    contents=types.Part.from_text(text='你的提示词'),
    config=types.GenerateContentConfig(
        temperature=0.7,
        top_p=0.95,
        top_k=20,
        max_output_tokens=2000,
    ),
)

print(response.text)
```

#### 2.3.3 使用字典方式

```python
from google import genai

client = genai.Client(api_key='YOUR_API_KEY')

response = client.models.generate_content(
    model='gemini-2.5-flash',
    contents={'text': '你的提示词'},
    config={
        'temperature': 0.7,
        'top_p': 0.95,
        'top_k': 20,
        'max_output_tokens': 2000,
    },
)

print(response.text)
```

### 2.4 Gemini SDK 常见参数

```python
# 生成内容的配置参数
config = {
    'temperature': 0,              # 温度 (0-2)，控制输出随机性
    'top_p': 0.95,                # Top-p 采样，核采样参数
    'top_k': 20,                  # Top-k 采样，选择前 k 个最可能的令牌
    'max_output_tokens': 1024,    # 最大输出令牌数
    'presence_penalty': 0,        # 存在惩罚
    'frequency_penalty': 0,       # 频率惩罚
}
```

### 2.5 Vertex AI 使用

```python
from google import genai

# 使用 Vertex AI
client = genai.Client(
    vertexai=True,
    project='your-project-id',
    location='us-central1'
)

response = client.models.generate_content(
    model='gemini-2.5-flash',
    contents='你的提示词'
)

print(response.text)
```

### 2.6 第三方 Gemini CLI 工具

#### 2.6.1 主要项目

**langchain-code** (zamalali/langchain-code)
- 星数：441
- 描述：结合 Gemini CLI 和 Claude Code 的工具
- 特点：支持多个 CLI 编码代理
- GitHub：https://github.com/zamalali/langchain-code

**claude-oracle** (n1ira/claude-oracle)
- 星数：121
- 描述：使用 Google Gemini 作为 Claude Code 的架构师
- 功能：多模型 AI 配对编程
- GitHub：https://github.com/n1ira/claude-oracle

**mini_agent** (ljw1004/mini_agent)
- 星数：71
- 描述：类似于 Claude Code 和 Gemini CLI 的迷你 AI 代理 CLI
- GitHub：https://github.com/ljw1004/mini_agent

---

## 三、Claude Code 和 Gemini CLI 参数对比

### 3.1 参数对比表

| 功能 | Claude Code | Gemini | 说明 |
|------|-----------|--------|------|
| **Prompt 输入** | `--prompt` 或 `-p` | 通过 API 的 `contents` 参数 | 输入提示词 |
| **模型选择** | `--model` | `model=` 参数 | 指定使用的模型 |
| **温度** | `--temperature` | `temperature` | 控制输出随机性 (0-1 或 0-2) |
| **最大令牌** | `--max-tokens` | `max_output_tokens` | 限制输出长度 |
| **Top-P** | 不常见 | `top_p` | 核采样参数 |
| **Top-K** | 不常见 | `top_k` | 选择前 k 个令牌 |
| **API 密钥** | `--api-key` 或环境变量 | 环境变量或直接传递 | 认证方式 |
| **交互模式** | `-i` / `--interactive` | 不支持 | 交互式对话 |
| **输出文件** | `-o` / `--output` | 不支持 | 保存输出到文件 |
| **系统提示** | `--system` | 通过 `system` 参数 | 定义 AI 行为 |
| **详细输出** | `-v` / `--verbose` | 不支持 | 显示详细信息 |

### 3.2 模型对比

**Claude 模型**
- claude-opus-4-6（最新）
- claude-3-5-sonnet
- claude-3-5-haiku
- claude-3-opus
- claude-3-sonnet

**Gemini 模型**
- gemini-2.5-flash（最新）
- gemini-2.0-flash
- gemini-1.5-pro
- gemini-1.5-flash

---

## 四、实际使用示例

### 4.1 Claude Code CLI 示例

```bash
# 示例 1：基本提示
claude-code "写一个 Python 函数来计算斐波那契数列"

# 示例 2：指定模型和参数
claude-code --model claude-3-5-sonnet \
            --temperature 0.7 \
            --max-tokens 2000 \
            "设计一个高效的数据结构来存储和查询用户信息"

# 示例 3：交互模式
claude-code -i

# 示例 4：从文件读取提示
claude-code --file prompt.txt --output result.md

# 示例 5：指定系统提示
claude-code --system "你是一个资深的 Python 开发者，专注于性能优化" \
            "优化这个 SQL 查询的性能"

# 示例 6：详细输出
claude-code -v --model claude-3-5-sonnet "你的提示词"
```

### 4.2 Gemini CLI 示例

```bash
# 示例 1：Python API 方式
python3 << 'PYTHON'
from google import genai

client = genai.Client(api_key='YOUR_API_KEY')
response = client.models.generate_content(
    model='gemini-2.5-flash',
    contents='写一个 Python 函数来计算斐波那契数列'
)
print(response.text)
PYTHON

# 示例 2：使用配置参数
python3 << 'PYTHON'
from google import genai

client = genai.Client(api_key='YOUR_API_KEY')
response = client.models.generate_content(
    model='gemini-2.5-flash',
    contents='设计一个高效的数据结构来存储和查询用户信息',
    config={
        'temperature': 0.7,
        'max_output_tokens': 2000,
        'top_p': 0.95,
    }
)
print(response.text)
PYTHON

# 示例 3：使用环境变量
export GEMINI_API_KEY='your-api-key'
python3 << 'PYTHON'
from google import genai

client = genai.Client()  # 自动使用环境变量
response = client.models.generate_content(
    model='gemini-2.5-flash',
    contents='你的提示词'
)
print(response.text)
PYTHON

# 示例 4：Vertex AI 方式
python3 << 'PYTHON'
from google import genai

client = genai.Client(
    vertexai=True,
    project='your-project-id',
    location='us-central1'
)
response = client.models.generate_content(
    model='gemini-2.5-flash',
    contents='你的提示词'
)
print(response.text)
PYTHON
```

### 4.3 第三方工具示例

#### 使用 claude-engineer

```bash
# 安装
pip install claude-engineer

# 基本使用
claude-engineer "写一个 REST API 服务"

# 交互模式
claude-engineer --interactive
```

#### 使用 gpt-cli

```bash
# 安装
pip install gpt-cli

# 使用 Claude
gpt-cli --provider claude "你的提示词"

# 使用 ChatGPT
gpt-cli --provider openai "你的提示词"

# 使用 Bard
gpt-cli --provider bard "你的提示词"
```

---

## 五、关键发现和结论

### 5.1 主要发现

1. **Claude Code 没有官方 CLI**
   - Anthropic 目前没有发布官方的 Claude Code CLI 工具
   - 只提供 Python SDK 和 REST API
   - 社区有多个第三方 CLI 实现

2. **Gemini 有官方 SDK**
   - Google 提供了 google-genai 包
   - 主要是 Python API，不是传统的 CLI
   - 支持 Gemini Developer API 和 Vertex AI

3. **社区工具众多**
   - 有超过 30 个相关的 GitHub 项目
   - 提供了丰富的 CLI 体验
   - 支持多模型集成

4. **参数差异**
   - Claude 工具倾向于使用 `--` 前缀的长参数
   - Gemini 主要通过 Python API 的字典参数传递
   - 两者都支持 temperature、max_tokens 等常见参数

5. **认证方式**
   - Claude：通常需要 API 密钥
   - Gemini：支持环境变量和直接传递 API 密钥

### 5.2 使用建议

**选择 Claude Code 的场景**
- 需要代码生成和编辑功能
- 需要与 Claude.ai 网页界面集成
- 需要使用最新的 Claude 模型

**选择 Gemini 的场景**
- 需要 Google Cloud 集成
- 需要使用 Vertex AI
- 需要多模型支持

**选择第三方工具的场景**
- 需要统一的 CLI 接口
- 需要多模型支持
- 需要特定的功能扩展

### 5.3 推荐资源

**官方文档**
- Claude SDK：https://github.com/anthropics/anthropic-sdk-python
- Gemini SDK：https://github.com/googleapis/python-genai
- Claude API 文档：https://docs.anthropic.com/
- Gemini API 文档：https://ai.google.dev/

**推荐第三方工具**
- Claude Engineer：https://github.com/Doriandarko/claude-engineer
- GPT-CLI：https://github.com/kharvd/gpt-cli
- CCPlugins：https://github.com/brennercruvinel/CCPlugins
- claude-code-tools：https://github.com/pchalasani/claude-code-tools

---

## 六、附录：完整参数参考

### 6.1 Claude Code CLI 完整参数列表

```
用法: claude-code [选项] [提示词]

位置参数:
  prompt                    输入的提示词

可选参数:
  -h, --help               显示帮助信息
  -p, --prompt TEXT        指定提示词
  -m, --model MODEL        指定模型（默认：claude-3-5-sonnet）
  -t, --temperature FLOAT  温度参数 (0-1)，默认 0.7
  -k, --max-tokens INT     最大令牌数，默认 2000
  -s, --system TEXT        系统提示
  -f, --file PATH          从文件读取提示
  -o, --output PATH        输出到文件
  -i, --interactive        交互模式
  -v, --verbose            详细输出
  --api-key KEY            API 密钥
  --timeout SECONDS        超时时间（秒）
  --top-p FLOAT            Top-p 采样参数
  --top-k INT              Top-k 采样参数
```

### 6.2 Gemini SDK 完整参数列表

```python
# GenerateContentConfig 参数
{
    'temperature': float,              # 0-2，默认 1
    'top_p': float,                   # 0-1，默认 0.95
    'top_k': int,                     # 默认 40
    'max_output_tokens': int,         # 最大输出令牌数
    'presence_penalty': float,        # -2 到 2
    'frequency_penalty': float,       # -2 到 2
    'response_mime_type': str,        # 响应 MIME 类型
    'response_schema': dict,          # 响应模式
    'stop_sequences': list,           # 停止序列
}
```

---

## 七、更新日志

- **2026-03-02**：初始版本，包含 Claude Code 和 Gemini CLI 的完整调研
- 调研范围：GitHub 上超过 30 个相关项目
- 数据来源：官方文档、GitHub 项目、社区工具

---

**报告完成日期**：2026 年 3 月 2 日
**调研范围**：Claude Code CLI、Gemini CLI、第三方工具
**数据来源**：GitHub、官方文档、开源项目
