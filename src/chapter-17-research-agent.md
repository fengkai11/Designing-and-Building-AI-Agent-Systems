# 第 17 章：项目一：任务型研究 Agent

前面的章节已经把 Agent 的核心机制拆开讲过：Agent Loop 负责让系统循环执行，工具系统负责让模型接触外部世界，上下文工程负责组织当前任务所需信息，Memory 和 RAG 负责处理长期经验与外部知识，Long-running Agent 负责长任务状态，Human-in-the-loop 负责风险控制，Evaluation 和 Observability 负责判断系统是否真的可靠。

但是，只理解这些机制还不够。Agent 最容易出现的问题，是每个模块单独看都能理解，真正组合在一起时却不知道从哪里开始。任务型研究 Agent 是一个非常适合作为综合项目的切入点：它足够真实，能够覆盖搜索、阅读、筛选、引用、总结、结构化输出、质量评估等关键能力；同时又不至于像外贸客户开发 Agent 或代码 Agent 那样一开始就涉及强副作用工具。

本章要构建的研究 Agent，不是一个“帮我写一篇文章”的普通写作助手，而是一个围绕研究问题持续工作的任务系统。它的输入是一个研究目标，输出不是一段随意生成的文字，而是一份带有来源、结构、结论、证据、不确定性和后续问题的研究报告。更重要的是，它在执行过程中要留下轨迹：搜索了什么，读了哪些资料，采信了哪些信息，丢弃了哪些来源，哪些结论证据充分，哪些结论仍需人工确认。

这类 Agent 的价值很大。技术学习中，它可以帮助开发者快速建立主题地图；商业分析中，它可以帮助运营人员调研市场、竞品和客户；产品设计中，它可以帮助团队整理用户需求、公开案例和行业趋势；科研学习中，它可以帮助学生梳理论文和关键概念。它也是后续外贸客户开发 Agent 的前置能力，因为外贸 Agent 的第一步本质上也是研究：研究市场、客户、渠道、竞品和触达路径。

本章会以工程项目的方式展开。我们先定义任务边界，再设计架构，然后实现最小版本，最后讨论如何增强可靠性和评估效果。

---

## 17.1 研究 Agent 要解决什么问题

普通聊天模型也能回答研究问题。例如你问：

> 当前 AI Agent 的主要技术路线有哪些？

模型可以直接生成一段答案，列出 ReAct、Plan-and-Execute、多 Agent、工具调用、RAG、记忆系统等方向。这个回答可能很流畅，也可能有一定参考价值。但它有几个明显问题。

第一，它不一定知道自己依据什么资料。如果模型基于训练数据回答，用户很难判断信息是否过时，尤其是技术领域变化很快。第二，它可能把不同来源的信息混在一起，无法区分事实、推测和观点。第三，它可能遗漏重要资料，但输出时仍然显得很自信。第四，它无法稳定复现研究过程，下一次问同样问题可能得到结构不同、结论不同的答案。第五，它很难支持团队协作，因为没有检索记录、来源列表和中间判断。

研究 Agent 的目标，就是把“凭模型直接回答”变成“围绕研究目标执行一段可追踪的研究流程”。

一个合格的研究 Agent 至少要完成以下事情。

首先，它要理解研究目标。用户的问题通常比较模糊。例如“帮我研究一下 VLA 路线”，这里的 VLA 是机器人领域的 Vision-Language-Action，还是别的缩写？用户想要学术综述，还是商业机会分析？想看近两年进展，还是从基础概念讲起？研究 Agent 必须把目标转成更明确的研究任务。

其次，它要拆解研究问题。一个好的研究报告不应该只是搜索几篇资料后拼接摘要，而应该把主题拆成子问题。例如研究 AI Agent 自主性机制，可以拆成任务规划、工具选择、记忆更新、自我反思、环境反馈、安全约束、评估方法、工业实践等子方向。

第三，它要检索和筛选资料。不是所有搜索结果都值得读。搜索结果里可能有广告、重复转载、低质量营销文章、过时教程、没有证据的观点。研究 Agent 要优先选择权威、直接、较新的资料，并记录来源。

第四，它要阅读和提取信息。阅读不是复制原文，而是提取与研究问题相关的观点、数据、定义、案例、限制条件和争议点。

第五，它要综合信息。多个来源可能相互补充，也可能相互矛盾。Agent 需要把碎片资料组织成有逻辑的结构，而不是把每篇资料分别总结一遍。

第六，它要标注不确定性。对于没有充分证据的判断，不能写成确定结论。比如“某路线会成为主流”这种判断，除非有充分数据支持，否则应该写成趋势推断。

第七，它要生成可复用报告。报告应该有清晰标题、摘要、关键结论、证据来源、详细分析、风险与不确定性、后续研究建议。

第八，它要留下过程记录。研究是可以复盘的。用户应该能看到搜索关键词、资料列表、采信原因、排除原因和最终引用。

所以，研究 Agent 的核心不是“写得像报告”，而是“用可审计的流程生成报告”。

---

## 17.2 任务边界：本章先做什么，不做什么

为了让项目可实现，本章先构建一个 Mini Research Agent。它不是完整商业产品，但要具备真实 Agent 的骨架。

本章版本支持以下能力：

输入一个研究问题；

生成研究计划；

根据计划生成搜索查询；

通过搜索工具获取候选资料；

读取资料摘要或正文片段；

提取关键信息；

把信息整理成研究笔记；

生成最终报告；

输出来源列表、置信度和不确定性；

保存执行轨迹。

本章暂时不追求以下能力：

不做复杂浏览器自动操作；

不做付费数据库检索；

不做完全自动论文解析；

不做多用户权限系统；

不做复杂前端工作台；

不做长周期定时研究任务。

这些能力可以在后续产品化阶段扩展。这里的重点是把研究 Agent 的核心工作流跑通。

在工程上，建议先把它做成命令行程序或后端服务，而不是一开始做复杂 Web UI。原因很简单：Agent 早期最重要的是验证执行链路和输出质量。界面可以让系统更好用，但如果底层研究流程不可靠，漂亮界面只会掩盖问题。

本章项目的最小输入可以是：

```text
研究主题：AI Agent 的自主性机制研究
研究目的：形成一份面向开发者的技术综述
关注重点：学术方向、工业实践、问题与挑战
输出格式：Markdown 报告
资料偏好：优先官方文档、论文、开源项目、公司技术博客
```

最小输出应该包括：

```text
1. 研究问题重述
2. 研究计划
3. 关键结论
4. 分主题分析
5. 来源与证据
6. 不确定性与待确认问题
7. 后续研究建议
8. 执行轨迹摘要
```

这个边界很重要。Agent 项目最容易失败的原因之一，就是一开始目标过大。比如你想做一个“全自动研究员”，它既能搜索网页，又能读论文，又能画图，又能做数据分析，还能长期跟踪新闻。这样的目标方向没错，但不适合第一版。第一版要先证明一个核心闭环：输入问题，执行研究，输出有来源、有结构、有判断的报告。

---

## 17.3 整体架构

任务型研究 Agent 可以分成七个核心模块。

第一，Task Intake，任务接收模块。它负责接收用户输入，把模糊目标整理成结构化任务。比如把“帮我研究一下具身智能 VLA”转成主题、目的、范围、时间、输出格式、资料偏好和排除条件。

第二，Research Planner，研究规划模块。它负责把研究目标拆成若干子问题，并为每个子问题生成搜索策略。比如把“VLA 路线”拆成定义、代表模型、数据采集、训练方法、评测指标、工业落地、瓶颈和机会。

第三，Search Tool，搜索工具。它负责根据查询词找到候选资料。真实系统可以接搜索 API、学术搜索、公司官网搜索、GitHub 搜索或内部知识库。最小实现中可以先用一个抽象接口，让工具返回若干候选文档。

第四，Source Reader，资料阅读模块。它负责读取搜索结果中的内容，提取标题、作者、发布时间、正文片段、关键段落和链接。真实系统里，这个模块要处理网页解析、PDF、Markdown、HTML、反爬限制和编码问题。

第五，Evidence Extractor，证据提取模块。它负责从资料中提取与研究问题相关的信息，形成结构化笔记。笔记不应该只是摘要，而应该包括观点、证据、适用范围、局限性和来源。

第六，Synthesizer，综合写作模块。它负责把多条研究笔记整合成最终报告。综合不是简单拼接，而是围绕研究问题形成结构化答案。

第七，Trace and Evaluation，轨迹与评估模块。它负责记录每一步操作，并对结果进行基本质量检查。例如是否覆盖所有子问题，是否有来源，是否有不确定性标注，是否存在没有证据支撑的结论。

可以用下面的结构表示：

```text
User Goal
   ↓
Task Intake
   ↓
Research Planner
   ↓
Search Queries
   ↓
Search Tool
   ↓
Candidate Sources
   ↓
Source Reader
   ↓
Evidence Extractor
   ↓
Research Notes
   ↓
Synthesizer
   ↓
Final Report
   ↓
Trace / Eval / Save
```

从 Agent 角度看，这不是一个完全自由的 Agent，而是“工作流约束下的 Agent”。每个阶段的目标明确，但阶段内部允许模型进行判断。例如规划阶段由模型拆问题，资料筛选阶段由模型判断相关性，综合阶段由模型组织报告。

这种架构比完全自由的 ReAct 循环更适合研究任务。原因是研究报告有天然阶段：先明确问题，再查资料，再读资料，再提取证据，再综合输出。如果让模型完全自由地反复搜索和写作，很容易出现重复搜索、过早总结、遗漏来源和上下文混乱。

---

## 17.4 数据模型设计

一个研究 Agent 能不能稳定运行，很大程度取决于数据模型是否清晰。不要把所有东西都当成字符串传来传去。任务、计划、来源、证据、报告和轨迹，都应该有结构化表示。

任务对象可以这样设计：

```python
from dataclasses import dataclass, field
from typing import List, Optional

@dataclass
class ResearchTask:
    topic: str
    purpose: str
    audience: str = "developers"
    scope: List[str] = field(default_factory=list)
    output_format: str = "markdown"
    source_preferences: List[str] = field(default_factory=list)
    exclude_sources: List[str] = field(default_factory=list)
    max_sources: int = 12
    language: str = "zh-CN"
```

这里的 `topic` 是研究主题，`purpose` 是研究目的，`audience` 决定报告写法，`scope` 用来限制范围，`source_preferences` 表示资料偏好，`exclude_sources` 表示不想使用的来源。

研究计划可以这样表示：

```python
@dataclass
class ResearchQuestion:
    id: str
    question: str
    reason: str
    search_queries: List[str]
    priority: int = 1

@dataclass
class ResearchPlan:
    task_id: str
    questions: List[ResearchQuestion]
    expected_sections: List[str]
```

注意，计划里不只有问题，还有为什么要研究这个问题。这个 `reason` 很重要，因为它可以帮助后续综合时判断某条信息是否相关。

资料来源可以这样表示：

```python
@dataclass
class SourceCandidate:
    title: str
    url: str
    snippet: str
    source_type: str = "web"
    published_at: Optional[str] = None
    authority_score: float = 0.5
    relevance_score: float = 0.0
```

资料来源需要区分权威性和相关性。一篇官方文档权威性高，但不一定和当前问题高度相关；一篇博客可能相关性高，但权威性一般。把这两个分开，有助于后续筛选。

证据笔记可以这样表示：

```python
@dataclass
class EvidenceNote:
    question_id: str
    source_url: str
    claim: str
    evidence: str
    limitation: str
    confidence: float
    tags: List[str] = field(default_factory=list)
```

这里最关键的是区分 `claim` 和 `evidence`。`claim` 是从资料中提炼出的观点或事实，`evidence` 是支撑它的依据，`limitation` 是适用范围或不足。很多低质量研究报告的问题，就是只有结论，没有证据，也没有限制条件。

最终报告可以这样表示：

```python
@dataclass
class ResearchReport:
    title: str
    executive_summary: str
    key_findings: List[str]
    sections: List[dict]
    uncertainties: List[str]
    next_steps: List[str]
    sources: List[SourceCandidate]
```

这些数据模型看起来简单，但它们会显著提升系统可控性。因为每个阶段都有明确输入和输出，后续评估和调试也更容易。

如果不做数据建模，常见写法是每一步都让模型返回一大段自然语言，然后下一步再让模型从自然语言中提取。这会导致两个问题：一是信息容易丢失，二是格式容易漂移。Agent 系统越复杂，越需要结构化中间状态。

---

## 17.5 任务接收：把模糊目标变成研究任务

用户输入往往是不完整的。例如：

> 帮我研究一下 OpenClaw、Hermes、Claude Code 对 Agent 开发有什么启发。

这个输入包含主题，但没有明确输出对象、深度、资料偏好和时间范围。任务接收模块要做的第一件事，是把它整理成结构化任务。

在产品中，最好通过表单或对话补充关键信息。但为了保持执行流畅，系统也可以使用默认规则。例如默认输出为 Markdown 技术综述，默认面向开发者，默认优先官方资料和开源 README，默认不编造闭源内部实现。

任务接收模块可以使用一个 prompt：

```text
你是研究任务分析器。请把用户输入转成结构化 ResearchTask。
如果用户没有说明目的，默认目的为“形成面向开发者的技术综述”。
如果用户没有说明资料偏好，默认优先官方文档、论文、开源项目 README、公司技术博客。
如果用户没有说明输出格式，默认 Markdown。
不要开始研究，只做任务结构化。
```

示例输出：

```json
{
  "topic": "OpenClaw、Hermes、Claude Code 对 Agent 开发的启发",
  "purpose": "形成面向开发者的技术综述，提炼可迁移的 Agent 架构模式",
  "audience": "具备工程基础、想构建 Agent Runtime 的开发者",
  "scope": [
    "产品形态",
    "任务执行机制",
    "工具系统",
    "上下文管理",
    "人机协同",
    "可借鉴模块"
  ],
  "source_preferences": [
    "官方文档",
    "开源项目 README",
    "公开技术博客"
  ],
  "exclude_sources": [
    "无法验证的二手猜测",
    "闭源内部实现的编造"
  ],
  "output_format": "markdown"
}
```

这个阶段看似简单，却能决定后续质量。因为后面的规划、搜索和报告都围绕这个任务对象展开。如果任务对象模糊，Agent 会在执行中不断偏移。

---

## 17.6 研究规划：把主题拆成可检索问题

研究规划不是简单列目录。目录是报告结构，研究问题是检索和分析的驱动力。

例如研究“任务型研究 Agent 如何实现”，目录可能是架构、数据模型、工具、评估等。但研究问题应该更具体：

Agent 如何判断研究问题是否拆解充分？

搜索结果如何筛选？

如何避免模型把无来源信息写成事实？

如何标注不确定性？

如何评价研究报告质量？

这些问题能够指导搜索和阅读。

研究规划模块可以输出这样的计划：

```json
{
  "questions": [
    {
      "id": "q1",
      "question": "任务型研究 Agent 与普通问答助手的区别是什么？",
      "reason": "需要明确项目价值和边界",
      "search_queries": [
        "AI research agent architecture",
        "LLM agent research workflow",
        "agentic research assistant evaluation"
      ],
      "priority": 1
    },
    {
      "id": "q2",
      "question": "研究 Agent 如何处理来源可信度与引用？",
      "reason": "报告可靠性取决于证据管理",
      "search_queries": [
        "LLM citation grounding research assistant",
        "RAG source attribution evaluation",
        "grounded generation citations LLM"
      ],
      "priority": 1
    }
  ],
  "expected_sections": [
    "研究目标与边界",
    "系统架构",
    "执行流程",
    "证据管理",
    "报告生成",
    "评估方法"
  ]
}
```

规划阶段需要避免两个问题。

第一个问题是拆得太宽。比如研究 AI Agent 时，计划里同时包含模型训练、芯片、机器人、代码生成、教育、金融、医疗，结果每个方向都很浅。解决方法是限制 scope，并给每个问题设置优先级。

第二个问题是拆得太细。比如把一个主题拆成几十个小问题，会导致搜索成本过高，报告也会碎片化。解决方法是把子问题控制在 4 到 8 个之间，除非任务明确要求深度调研。

对于本章的 Mini Research Agent，建议默认生成 5 个左右研究问题，每个问题 2 到 3 个搜索查询。

---

## 17.7 搜索工具：不要把搜索结果当成事实

搜索工具是研究 Agent 的入口，但搜索结果不是事实。搜索引擎返回的是候选资料，不是结论。

很多研究 Agent 的错误来自这一点：看到搜索结果标题和摘要，就直接写入报告。标题可能夸张，摘要可能断章取义，页面可能过时，甚至搜索结果可能是广告。正确做法是把搜索结果当成待验证线索。

搜索工具的返回结构至少应该包括标题、链接、摘要、来源类型和时间信息。不要只返回字符串列表。

```python
class SearchTool:
    def search(self, query: str, max_results: int = 5) -> list[SourceCandidate]:
        raise NotImplementedError
```

如果暂时没有真实搜索 API，可以先实现一个 MockSearchTool，用固定数据模拟。这样便于开发主流程。

```python
class MockSearchTool(SearchTool):
    def search(self, query: str, max_results: int = 5) -> list[SourceCandidate]:
        return [
            SourceCandidate(
                title="Example: LLM Research Agents",
                url="https://example.com/research-agents",
                snippet="An overview of agentic workflows for research tasks.",
                source_type="web",
                authority_score=0.6,
            )
        ]
```

真实系统中，搜索工具还需要考虑缓存。研究 Agent 很容易重复搜索同一个查询，导致成本浪费。可以用 query 作为 key，把搜索结果保存到本地缓存中。

```python
class CachedSearchTool(SearchTool):
    def __init__(self, backend: SearchTool):
        self.backend = backend
        self.cache = {}

    def search(self, query: str, max_results: int = 5):
        key = (query, max_results)
        if key not in self.cache:
            self.cache[key] = self.backend.search(query, max_results)
        return self.cache[key]
```

搜索阶段还需要去重。同一个页面可能被不同查询命中，同一个来源可能有多个 URL 参数。简单实现可以按规范化 URL 去重。

```python
from urllib.parse import urlparse, urlunparse

def normalize_url(url: str) -> str:
    parsed = urlparse(url)
    return urlunparse((parsed.scheme, parsed.netloc, parsed.path.rstrip('/'), '', '', ''))
```

这些工程细节很重要。研究 Agent 如果不去重、不缓存、不记录搜索词，很快就会变得不可控。

---

## 17.8 资料筛选：相关性、权威性和新鲜度

搜索返回候选资料后，Agent 不能全部阅读。它需要筛选。

筛选可以从三个维度进行：相关性、权威性和新鲜度。

相关性指资料是否直接回答研究问题。比如研究“Agent 评估方法”，一篇介绍 ChatGPT 使用技巧的文章相关性较低，即使它谈到了 Agent。

权威性指资料来源是否可靠。官方文档、论文、开源项目 README、公司技术博客通常比无来源营销文章更可靠。当然，权威性不是绝对的。官方文档可能偏产品宣传，论文可能不适合工程落地，博客可能有实践经验但缺少严谨验证。

新鲜度指资料是否足够新。对于稳定概念，旧资料仍有价值；对于快速变化的工具和产品，旧资料可能过时。研究 Agent 应该根据任务类型决定是否重视新鲜度。

可以设计一个简单评分函数：

```python
def score_source(source: SourceCandidate, question: ResearchQuestion) -> float:
    score = 0.0
    score += source.authority_score * 0.4
    score += source.relevance_score * 0.5
    if source.published_at:
        score += 0.1
    return score
```

在最小实现中，相关性评分可以由模型判断。输入研究问题、搜索结果标题和摘要，让模型给出 0 到 1 的相关性，并说明原因。

```text
请判断下面资料是否适合回答研究问题。
研究问题：{question}
资料标题：{title}
资料摘要：{snippet}
请输出 JSON：relevance_score, reason, should_read。
```

示例输出：

```json
{
  "relevance_score": 0.82,
  "reason": "资料直接讨论了研究 Agent 的执行流程和来源引用问题",
  "should_read": true
}
```

资料筛选阶段不要追求完美。它的作用是减少明显无关资料，把有限阅读预算用于更有价值的来源。真正的判断还要在阅读阶段完成。

---

## 17.9 资料阅读与证据提取

资料阅读模块要解决的问题是：如何从长文本中提取对研究问题有用的信息。

不要让模型直接“总结这篇文章”。这太泛了。更好的做法是围绕具体研究问题提取证据。

例如，研究问题是：

> 研究 Agent 如何避免没有来源支撑的结论？

给模型的任务应该是：

```text
请阅读以下资料片段，只提取与研究问题相关的信息。
研究问题：研究 Agent 如何避免没有来源支撑的结论？
资料片段：...
请输出：
1. 可以支持的结论 claim；
2. 支撑该结论的 evidence；
3. 适用范围 limitation；
4. 置信度 confidence；
5. 不要输出资料中没有的信息。
```

输出应该是结构化笔记，而不是完整文章：

```json
{
  "claim": "研究报告生成系统需要保留来源引用，以便用户验证结论。",
  "evidence": "资料指出，生成式系统在回答中附带来源可以改善可验证性，但引用本身仍需检查。",
  "limitation": "该资料主要讨论 RAG 问答，不完全等同于长报告研究 Agent。",
  "confidence": 0.78,
  "tags": ["citation", "grounding", "evaluation"]
}
```

证据提取时要注意三件事。

第一，不要过度概括。如果资料只说“某种方法在一个数据集上有效”，不要扩展成“这种方法在所有场景都有效”。

第二，保留限制条件。限制条件是高质量研究的标志。低质量报告喜欢只写结论，高质量报告会说明结论在什么条件下成立。

第三，允许空结果。如果资料和问题无关，模型应该输出“无相关证据”，而不是硬凑摘要。

这可以在 prompt 中明确要求：

```text
如果资料不能支持任何与研究问题相关的结论，请返回空数组，不要为了完成任务编造信息。
```

---

## 17.10 研究笔记：中间产物比最终报告更重要

研究 Agent 的中间产物是研究笔记。很多系统只关注最终报告，但实际工程中，中间笔记更重要。

原因有三个。

第一，笔记可以复用。今天研究 AI Agent 自主性，明天研究 Agent 安全，同一篇关于工具权限的资料可能都能用。

第二，笔记可以审计。用户如果质疑某个结论，可以回到笔记查看来源和证据。

第三，笔记可以增量更新。长期研究任务不应该每次从零开始，而应该在已有笔记基础上补充新资料。

研究笔记可以按问题组织：

```text
notes/
├── q1-agent-vs-chatbot.md
├── q2-source-grounding.md
├── q3-evaluation.md
└── q4-productization.md
```

每条笔记可以包含：

```markdown
## Claim
研究 Agent 应该区分搜索结果、来源内容和最终结论。

## Evidence
来源 A 指出搜索结果只是候选资料，不能直接作为事实依据。

## Limitation
该观点主要适用于开放网络研究，对于内部文档检索场景还需要考虑权限和版本问题。

## Source
- title: ...
- url: ...
- accessed_at: ...

## Tags
source-grounding, research-workflow

## Confidence
0.82
```

这种结构看起来比一段自然语言麻烦，但它非常适合长期积累。后续你可以把笔记写入向量库，也可以写入关系数据库，还可以供评估系统检查。

研究 Agent 的一个重要原则是：最终报告只是展示层，研究笔记才是资产层。

---

## 17.11 报告生成：综合，不是拼接

当研究笔记积累到一定数量后，Agent 要生成报告。报告生成不是把笔记逐条拼接，而是围绕研究目标进行综合。

一个好的研究报告至少包含以下结构：

```markdown
# 标题

## 摘要
用几段话说明研究问题、核心结论和适用范围。

## 关键结论
列出 5 到 8 条最重要结论。

## 背景与问题定义
解释为什么这个问题重要，以及本报告的边界。

## 分主题分析
按研究问题展开。

## 争议与不确定性
说明资料不足、观点分歧和需要进一步验证的地方。

## 对实践的启发
把研究结论转成开发、产品或决策建议。

## 后续研究问题
列出下一步应该研究什么。

## 来源列表
列出使用过的资料。
```

报告生成 prompt 要明确要求模型引用笔记，而不是凭空写作：

```text
你是研究报告写作者。请只基于给定研究笔记生成报告。
如果某个结论没有笔记支持，请不要写成确定事实。
对于证据不足的内容，请放入“不确定性”部分。
报告要面向 {audience}，使用 {language}，格式为 Markdown。
```

这里有一个关键技巧：先生成报告大纲，再生成正文。

如果直接让模型生成完整报告，它可能遗漏部分问题。更稳妥的方式是两步：

第一步，根据研究任务和笔记生成报告结构；

第二步，逐节写正文。

对于长报告，还可以分节生成，最后统一润色。但要注意，分节生成时需要共享全局结论，避免各节重复或矛盾。

---

## 17.12 最小实现：ResearchAgent 类

下面给出一个简化版 ResearchAgent 的结构。它不依赖具体模型接口，重点展示执行链路。

```python
class ResearchAgent:
    def __init__(self, model, search_tool, reader, trace_store):
        self.model = model
        self.search_tool = search_tool
        self.reader = reader
        self.trace_store = trace_store

    def run(self, user_input: str) -> ResearchReport:
        task = self.create_task(user_input)
        self.trace_store.record("task_created", task)

        plan = self.create_plan(task)
        self.trace_store.record("plan_created", plan)

        sources = self.collect_sources(plan, task.max_sources)
        self.trace_store.record("sources_collected", sources)

        notes = self.extract_notes(plan, sources)
        self.trace_store.record("notes_extracted", notes)

        report = self.synthesize_report(task, plan, notes, sources)
        self.trace_store.record("report_created", report)

        self.evaluate_report(task, plan, notes, report)
        return report
```

每个方法都应该保持职责清晰。

`create_task` 只做任务结构化，不做搜索。

`create_plan` 只做研究规划，不写报告。

`collect_sources` 只负责搜索、去重和筛选。

`extract_notes` 只负责从资料中提取证据。

`synthesize_report` 只基于笔记生成报告。

`evaluate_report` 检查报告质量。

这种分层能让系统更容易调试。假设最终报告质量差，你可以判断问题出在计划不完整、搜索结果差、资料阅读差、笔记提取差，还是综合写作差。

---

## 17.13 执行轨迹：让研究过程可复盘

研究 Agent 必须记录轨迹。轨迹不是为了好看，而是为了调试、评估和建立信任。

最小轨迹可以包括：

任务输入；

结构化任务；

研究计划；

搜索查询；

搜索结果；

被采纳来源；

被排除来源及原因；

提取的证据笔记；

最终报告；

质量检查结果。

TraceStore 可以简单实现为 JSON Lines：

```python
import json
from datetime import datetime

class TraceStore:
    def __init__(self, path: str):
        self.path = path

    def record(self, event_type: str, payload):
        event = {
            "time": datetime.utcnow().isoformat(),
            "event_type": event_type,
            "payload": payload,
        }
        with open(self.path, "a", encoding="utf-8") as f:
            f.write(json.dumps(event, ensure_ascii=False, default=str) + "\n")
```

真实系统中，trace 可以写入数据库，并支持前端回放。但第一版用 JSON Lines 足够。

有了轨迹后，用户就可以问：

为什么报告中说“研究 Agent 需要引用来源”？

Agent 使用了哪些资料？

是否有资料被排除？为什么？

某条结论的置信度是多少？

这些问题能被回答，研究 Agent 才有可信度。

---

## 17.14 质量评估：不要只看报告是否流畅

研究 Agent 的报告很容易“看起来很好”。大模型擅长组织语言，即使证据不足，也能写出结构完整、语气坚定的文本。所以评估不能只看流畅度。

可以从以下维度评估。

第一，覆盖度。研究计划中的关键问题是否都被回答？如果计划有 6 个问题，报告只回答了 3 个，就说明覆盖不足。

第二，证据支撑。关键结论是否有来源或笔记支持？如果报告里出现大量没有来源的判断，要降低评分。

第三，来源质量。使用的资料是否权威、相关、足够新？是否过度依赖低质量博客？

第四，综合能力。报告是否只是逐条摘要，还是形成了跨来源分析？

第五，不确定性标注。报告是否把推测和事实区分开？是否指出资料不足？

第六，任务对齐。报告是否符合用户目的和受众？面向开发者的报告应该有工程启发，面向投资人的报告则应强调市场、团队和商业机会。

可以设计一个简单评估器：

```python
class ResearchReportEvaluator:
    def evaluate(self, task, plan, notes, report):
        return {
            "coverage_score": self.coverage(plan, report),
            "evidence_score": self.evidence_support(notes, report),
            "uncertainty_score": self.uncertainty(report),
            "alignment_score": self.alignment(task, report),
        }
```

最小版本中，这些评分可以人工打分；进阶版本可以用模型辅助评分。但模型评分也不能完全可信，最好结合规则检查。例如：报告中的关键结论数量、每节是否有来源、是否存在“绝对化词语”、是否有不确定性部分。

研究 Agent 的目标不是一次就生成完美报告，而是建立可改进循环。每次任务结束后，把评分、失败原因和用户反馈记录下来，下次改进规划和提示词。

---

## 17.15 常见失败模式与修复方法

研究 Agent 常见失败模式很多。提前认识它们，可以避免项目走偏。

第一种失败，是过早写报告。Agent 搜索两三个结果后就开始总结，导致覆盖不足。修复方法是强制规划阶段和资料收集阶段分离，只有达到最小来源数量或覆盖所有研究问题后才能进入写作阶段。

第二种失败，是搜索词太泛。比如研究“Agent 记忆系统”，搜索词只有“AI memory”，结果会混入心理学、硬件、神经科学等无关内容。修复方法是让 Planner 生成更具体查询，例如“LLM agent memory architecture”、“conversational memory vector store agent”。

第三种失败，是把搜索摘要当证据。修复方法是规定搜索结果只能进入候选来源，不能直接进入最终报告。报告只能引用阅读后提取的 EvidenceNote。

第四种失败，是报告没有不确定性。修复方法是在报告模板中强制加入“不确定性与待确认问题”，并让评估器检查这一节是否存在。

第五种失败，是来源重复。修复方法是 URL 规范化、标题相似度去重、域名聚合。

第六种失败，是低质量来源污染。修复方法是来源评分和资料偏好规则。比如优先官方文档、论文、开源 README，降低营销站和转载站权重。

第七种失败，是上下文过长。修复方法是把资料阅读结果压缩为结构化笔记，最终报告只使用笔记，而不是把所有原文塞给模型。

第八种失败，是模型生成格式漂移。修复方法是使用 JSON schema、重试解析和格式校验。

第九种失败，是结论过度确定。修复方法是要求每条关键结论附带 confidence，并把低置信度结论放入不确定性部分。

第十种失败，是用户无法干预。修复方法是在计划生成后提供人工确认节点，让用户可以增删研究问题和资料偏好。

这些失败模式说明，研究 Agent 的可靠性不是靠一个大 prompt，而是靠流程、数据模型、约束和评估共同实现。

---

## 17.16 工程化改进方向

当最小版本跑通后，可以逐步增加能力。

第一个方向，是多源检索。除了 Web 搜索，还可以接入论文数据库、GitHub、官方文档站点、内部知识库和用户上传文件。不同来源应有不同解析器和评分规则。

第二个方向，是引用系统。最终报告中的关键结论可以引用 EvidenceNote，而 EvidenceNote 再链接到原始来源。这样可以做到结论级可追溯。

第三个方向，是交互式研究。Agent 生成研究计划后，先让用户确认；资料筛选后，让用户选择重点来源；报告生成前，让用户调整结构。这比完全自动更可靠。

第四个方向，是长期研究记忆。系统可以保存每次研究笔记，后续同主题任务优先检索历史笔记，再补充新资料。

第五个方向，是任务模板。常见研究任务可以模板化，例如技术综述、竞品分析、市场调研、开源项目分析、论文阅读、政策分析。不同模板有不同计划结构和评估标准。

第六个方向，是报告版本管理。研究报告应该支持版本保存和差异比较。尤其是长期跟踪任务，用户需要知道本周相比上周新增了什么。

第七个方向，是可视化工作台。展示任务进度、搜索结果、来源评分、笔记卡片、报告大纲、待确认问题和最终报告。

这些改进都可以在本章架构上延伸。最重要的是，先保持核心链路清晰。

---

## 17.17 与后续外贸 Agent 的关系

本章的研究 Agent 不是孤立项目。下一章要做外贸客户开发 Agent，它的第一阶段就是研究。

外贸 Agent 需要研究目标市场：这个国家有哪些渠道？哪些客户类型更适合？当地常用搜索词是什么？有哪些展会、协会、B2B 平台、批发市场？进口商和分销商通常如何展示自己？哪些信号代表客户价值？哪些信号代表风险？

这些都可以复用 Research Agent 的能力。

区别在于，外贸 Agent 不止生成报告，还要进一步产出客户线索、商机评分、开发信草稿和跟进任务。也就是说，研究 Agent 更偏信息整理，外贸 Agent 更偏业务执行。

因此，本章可以看成后续商业化 Agent 的基础模块。一个外贸获客系统中，完全可以有一个 Research Worker，专门负责市场和客户类型研究；另一个 Lead Worker 负责线索搜索；另一个 Scoring Worker 负责评分；另一个 Outreach Worker 负责邮件草稿和跟进。

这也体现了 Agent 系统设计中的一个原则：复杂 Agent 不一定是一个巨大的 Agent，而可以由多个职责清晰的 Agent 或 Worker 组成。

---

## 练习题

### 练习 1：定义一个研究任务

选择一个你关心的技术主题，例如“代码 Agent 的上下文工程”“具身智能 VLA 数据采集”“外贸获客 Agent 的客户评分机制”。把它写成 ResearchTask，包括主题、目的、受众、范围、资料偏好和输出格式。

### 练习 2：拆解研究问题

针对练习 1 的主题，拆解出 5 到 8 个研究问题。每个问题都要写明为什么要研究它，并给出 2 到 3 个搜索查询。

### 练习 3：设计来源评分规则

为你的研究任务设计来源评分规则。至少考虑相关性、权威性、新鲜度和可验证性。说明不同来源类型如何加权，例如官方文档、论文、博客、论坛、营销文章。

### 练习 4：设计 EvidenceNote

从一篇技术文章中提取 3 条 EvidenceNote。每条都要包含 claim、evidence、limitation、confidence 和 source。

### 练习 5：评估一份报告

找一篇由大模型生成的技术报告，从覆盖度、证据支撑、来源质量、综合能力、不确定性标注和任务对齐六个维度进行评分。

---

## 检查清单

```text
[ ] 我能说明研究 Agent 与普通问答助手的区别。
[ ] 我理解搜索结果不是事实，只是候选来源。
[ ] 我能把模糊研究目标结构化为 ResearchTask。
[ ] 我能把研究主题拆成可检索的研究问题。
[ ] 我知道为什么研究笔记比最终报告更重要。
[ ] 我能设计 SourceCandidate、EvidenceNote 和 ResearchReport 数据模型。
[ ] 我能说明相关性、权威性和新鲜度的区别。
[ ] 我知道如何避免模型生成没有来源支撑的结论。
[ ] 我能设计研究 Agent 的执行轨迹。
[ ] 我能从覆盖度、证据支撑和不确定性等维度评估报告质量。
```

---

## 本章总结

本章完成了第一个综合项目：任务型研究 Agent。它的价值不在于让模型写出一篇流畅文章，而在于把研究任务变成可规划、可检索、可审计、可评估的执行流程。

研究 Agent 的核心链路是：接收任务，结构化目标，拆解研究问题，生成搜索查询，收集候选来源，筛选资料，提取证据笔记，综合生成报告，记录执行轨迹，并对报告质量进行评估。这个链路覆盖了 Agent 系统中的多个关键机制：规划、工具调用、上下文压缩、结构化中间状态、来源管理、报告生成、可观测性和评估。

本章还强调了几个重要原则。第一，搜索结果不是事实，必须经过阅读和证据提取。第二，最终报告不是唯一资产，研究笔记才是可复用的知识资产。第三，报告生成应该基于证据，而不是让模型自由发挥。第四，研究 Agent 的可靠性来自流程和数据模型，而不是一个万能 prompt。第五，研究 Agent 是后续外贸客户开发 Agent、代码分析 Agent 和企业知识 Agent 的基础能力。

下一章将进入全书最重要的商业化综合项目：外贸客户开发 Agent。它会在研究 Agent 的基础上继续增加客户识别、线索去重、客户画像、商机评分、开发信生成、审批队列、触达记录和跟进调度，把 Agent 从“信息研究工具”推进到“真实业务执行系统”。
