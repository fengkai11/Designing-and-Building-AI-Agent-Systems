# 代码目录说明

本文件说明本书配套代码应该如何组织。它不是要求读者一次性实现全部代码，而是给出一个可以逐步演进的工程结构。建议从 `mini-agent-runtime-v1` 开始，随着章节推进逐步升级到 `v2`、`v3` 和综合项目目录。

## 一、代码总体目标

本书配套代码的目标不是复刻某个成熟框架，而是帮助读者理解 Agent 系统的核心机制：

- Agent Loop 如何运转；
- 工具如何注册、选择、调用、审计；
- 上下文如何组装、压缩和注入；
- 记忆和 RAG 如何区分；
- 长任务如何保存状态、恢复和取消；
- 高风险动作如何进入审批；
- 执行过程如何评估、追踪和回放；
- 综合项目如何从机制组合成产品原型。

## 二、推荐目录结构

```text
agent-book-code/
├── README.md
├── pyproject.toml
├── .env.example
├── docs/
│   ├── architecture.md
│   ├── tool-design.md
│   ├── memory-design.md
│   └── eval-design.md
├── mini-agent-runtime/
│   ├── v1_agent_loop/
│   ├── v2_memory_rag_scheduler/
│   └── v3_safe_evaluable_runtime/
├── packages/
│   ├── agent_core/
│   ├── tools/
│   ├── context/
│   ├── memory/
│   ├── rag/
│   ├── scheduler/
│   ├── approval/
│   ├── evals/
│   └── observability/
├── projects/
│   ├── research_agent/
│   ├── foreign_trade_agent/
│   └── code_agent_mini/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── eval_cases/
└── examples/
    ├── run_react_agent.py
    ├── run_planner_executor.py
    ├── run_research_agent.py
    ├── run_foreign_trade_agent.py
    └── run_code_agent_mini.py
```

## 三、分阶段实现路线

### 阶段 1：mini-agent-runtime-v1

对应章节：第 4–7 章。

目标是实现一个可以运行的最小 Agent Runtime。

```text
mini-agent-runtime/v1_agent_loop/
├── README.md
├── agent_loop.py
├── model_client.py
├── tool_registry.py
├── tools.py
├── context_manager.py
├── planner.py
├── executor.py
└── run_demo.py
```

最低可用能力：

1. 接收用户目标；
2. 构造上下文；
3. 调用模型生成下一步动作；
4. 调用工具；
5. 保存工具结果；
6. 判断是否停止；
7. 输出最终结果。

建议先实现这些工具：

| 工具 | 风险等级 | 说明 |
|---|---|---|
| `calculator` | 低 | 用于数值计算 |
| `read_text_file` | 低 | 读取本地文本文件 |
| `write_draft_file` | 中 | 写入草稿文件，不覆盖原文件 |
| `mock_search` | 低 | 用本地模拟数据代替真实搜索 |
| `ask_user` | 低 | 让 Agent 请求人工补充信息 |

### 阶段 2：mini-agent-runtime-v2

对应章节：第 8–10 章。

目标是加入记忆、RAG 和长任务状态。

```text
mini-agent-runtime/v2_memory_rag_scheduler/
├── memory_store.py
├── memory_schema.py
├── document_loader.py
├── text_splitter.py
├── vector_index.py
├── retriever.py
├── task_state.py
├── job_queue.py
├── checkpoint.py
└── run_long_task.py
```

新增能力：

1. 区分会话记忆、任务记忆、用户记忆、领域知识和经验记忆；
2. 支持 Markdown 文档导入、切分、索引、检索；
3. 支持长任务状态保存；
4. 支持任务暂停、恢复、取消和重试；
5. 支持 checkpoint 和中间产物保存。

### 阶段 3：mini-agent-runtime-v3

对应章节：第 11–13 章。

目标是让系统具备基本的安全、评估和可观测能力。

```text
mini-agent-runtime/v3_safe_evaluable_runtime/
├── approval_queue.py
├── risk_policy.py
├── audit_log.py
├── eval_harness.py
├── eval_cases.yaml
├── trace.py
├── event_log.py
├── replay.py
└── dashboard_stub.py
```

新增能力：

1. 根据工具风险等级决定自动执行、审批或禁止；
2. 记录每一次模型调用、工具调用、状态变化和人工审批；
3. 支持离线评估任务；
4. 支持失败任务回放；
5. 支持成本、延迟、成功率和错误类型统计。

## 四、核心包说明

### `packages/agent_core`

负责 Agent Runtime 的核心抽象。

```text
agent_core/
├── agent.py
├── loop.py
├── state.py
├── message.py
├── action.py
├── result.py
└── errors.py
```

关键对象：

- `AgentTask`：用户给出的任务目标；
- `AgentState`：当前执行状态；
- `AgentAction`：模型决定的下一步动作；
- `AgentResult`：最终输出；
- `AgentLoop`：执行循环；
- `StopReason`：停止原因，例如完成、失败、达到最大步数、等待人工确认。

### `packages/tools`

负责工具系统。

```text
tools/
├── base.py
├── registry.py
├── schema.py
├── policy.py
├── builtin/
│   ├── calculator.py
│   ├── file_tools.py
│   ├── search_tools.py
│   ├── email_tools.py
│   └── shell_tools.py
└── tests/
```

设计要求：

1. 工具必须有名称、描述、参数 schema、返回 schema；
2. 工具必须声明风险等级；
3. 工具必须有 timeout；
4. 写入型工具必须支持 dry-run 或审批；
5. 高风险工具必须记录审计日志。

### `packages/context`

负责上下文工程。

```text
context/
├── manager.py
├── prompt_builder.py
├── compression.py
├── budget.py
└── policies.py
```

设计要求：

1. 区分系统约束、任务目标、历史记录、工具结果、检索资料和记忆；
2. 控制 token budget；
3. 支持按优先级裁剪；
4. 支持上下文摘要；
5. 支持引用来源。

### `packages/memory`

负责长期记忆。

```text
memory/
├── store.py
├── schema.py
├── policy.py
├── retriever.py
└── maintenance.py
```

建议 schema：

| 字段 | 说明 |
|---|---|
| `id` | 记忆 ID |
| `type` | user / task / domain / experience / preference |
| `content` | 记忆内容 |
| `source` | 来源 |
| `confidence` | 置信度 |
| `created_at` | 创建时间 |
| `updated_at` | 更新时间 |
| `expires_at` | 可选过期时间 |
| `tags` | 标签 |
| `visibility` | 权限范围 |

### `packages/rag`

负责知识库检索。

```text
rag/
├── loader.py
├── splitter.py
├── embedding.py
├── index.py
├── retriever.py
├── reranker.py
└── citation.py
```

设计要求：

1. 文档可追溯；
2. chunk 有来源；
3. 检索结果要进入上下文，而不是直接当成最终答案；
4. 重要结论要能回到来源；
5. RAG 与 Memory 不要混用。

### `packages/scheduler`

负责长期任务。

```text
scheduler/
├── job.py
├── queue.py
├── worker.py
├── checkpoint.py
├── retry.py
└── cancellation.py
```

设计要求：

1. 任务可以排队；
2. 任务可以恢复；
3. 任务可以取消；
4. 失败有重试策略；
5. 每个任务有状态机。

### `packages/approval`

负责人工审批。

```text
approval/
├── queue.py
├── request.py
├── decision.py
├── policy.py
└── audit.py
```

审批对象应包含：

- Agent 建议执行的动作；
- 动作原因；
- 输入参数；
- 可能影响；
- 风险等级；
- 可选操作：批准、拒绝、修改后批准、要求 Agent 重新生成。

### `packages/evals`

负责评估。

```text
evals/
├── case.py
├── dataset.py
├── harness.py
├── metrics.py
├── judge.py
└── report.py
```

评估维度：

- 任务成功率；
- 工具调用正确率；
- 结果质量；
- 安全合规；
- 成本；
- 延迟；
- 可解释性。

### `packages/observability`

负责可观测性。

```text
observability/
├── trace.py
├── span.py
├── event.py
├── logger.py
├── replay.py
└── metrics.py
```

每一步至少记录：

- step id；
- 输入上下文摘要；
- 模型输出；
- 工具调用；
- 工具结果；
- 状态变化；
- 错误信息；
- token 成本；
- 耗时。

## 五、综合项目目录

### `projects/research_agent`

对应第 17 章。

```text
research_agent/
├── README.md
├── config.yaml
├── agent.py
├── tools.py
├── report_writer.py
├── source_manager.py
├── eval_cases.yaml
└── outputs/
```

最小闭环：

1. 输入研究问题；
2. 拆解子问题；
3. 检索资料；
4. 摘要来源；
5. 生成报告；
6. 标记不确定性；
7. 输出 Markdown。

### `projects/foreign_trade_agent`

对应第 18 章。

```text
foreign_trade_agent/
├── README.md
├── config.yaml
├── lead_schema.py
├── search_strategy.py
├── lead_extractor.py
├── lead_scorer.py
├── email_draft.py
├── approval_flow.py
├── followup_scheduler.py
├── crm_store.py
└── outputs/
```

最小闭环：

1. 输入产品、目标国家和客户类型；
2. 搜索候选客户；
3. 提取客户信息；
4. 去重和排除；
5. 生成客户画像；
6. 商机评分；
7. 生成开发信草稿；
8. 等待人工审批；
9. 记录触达历史；
10. 生成跟进建议。

### `projects/code_agent_mini`

对应第 19 章。

```text
code_agent_mini/
├── README.md
├── repo_reader.py
├── file_search.py
├── edit_plan.py
├── patch_writer.py
├── test_runner.py
├── diff_viewer.py
├── checkpoint.py
├── rollback.py
└── outputs/
```

最小闭环：

1. 输入代码修改需求；
2. 读取项目结构；
3. 找到相关文件；
4. 生成修改计划；
5. 等待确认；
6. 修改文件；
7. 运行测试；
8. 失败则修复；
9. 输出 diff；
10. 等待用户 review。

## 六、推荐开发顺序

```text
第 1 步：实现 v1 Agent Loop
第 2 步：实现 Tool Registry
第 3 步：实现 Context Manager
第 4 步：实现 Planner / Executor
第 5 步：实现 Memory Store
第 6 步：实现 Markdown RAG
第 7 步：实现 Task State + Checkpoint
第 8 步：实现 Approval Queue
第 9 步：实现 Trace + Replay
第 10 步：实现 Eval Harness
第 11 步：实现 Research Agent
第 12 步：实现 Foreign Trade Agent
第 13 步：实现 Code Agent Mini
```

## 七、交给 Codex 的开发提示词模板

```markdown
你现在是本项目的代码实现助手。请阅读当前代码目录和《代码目录说明.md》，按照书稿第 X 章的目标实现对应模块。

要求：
1. 不要一次性实现全量系统；
2. 先完成当前阶段的最小闭环；
3. 每个模块必须有清晰接口和类型注解；
4. 工具调用必须有风险等级和错误处理；
5. 高风险动作默认 dry-run，不允许直接执行；
6. 每次修改后运行测试；
7. 输出变更摘要和下一步建议。

本次任务：
- 实现模块：XXX
- 对应章节：第 X 章
- 预期文件：XXX
- 验收标准：XXX
```

## 八、验收标准

一个阶段是否完成，不看文件数量，而看是否形成闭环。

| 阶段 | 验收标准 |
|---|---|
| v1 | 能执行 3–5 步 Agent Loop，并正确调用工具 |
| v2 | 能保存任务状态，能使用记忆和 RAG 支持回答 |
| v3 | 能审批高风险动作，能记录 trace，能运行评估集 |
| Research Agent | 能生成带来源和不确定性说明的研究报告 |
| Foreign Trade Agent | 能生成可审核的客户列表、评分和开发信草稿 |
| Code Agent Mini | 能读取 repo、生成修改计划、产生 diff、运行测试 |

## 九、最重要的工程原则

1. 先闭环，再扩展。
2. 先可控，再自主。
3. 先可观测，再优化。
4. 先人工确认，再自动执行。
5. 先小工具，再大工具。
6. 先本地模拟，再接真实 API。
7. 先评估，再谈效果。


## 十、命名约定与正文映射

为了让正文和代码保持一致，建议采用以下映射：

| 正文术语 | 代码类 / 模块建议 | 目录建议 |
|---|---|---|
| Agent Runtime | `AgentRuntime` | `packages/agent_core/runtime.py` |
| Agent Loop | `AgentLoop` | `packages/agent_core/loop.py` |
| Planner | `Planner` | `packages/agent_core/planner.py` |
| Executor | `Executor` | `packages/agent_core/executor.py` |
| Tool Registry | `ToolRegistry` | `packages/tools/registry.py` |
| Context Manager | `ContextManager` | `packages/context/manager.py` |
| Memory Store | `MemoryStore` | `packages/memory/store.py` |
| RAG Retriever | `RagRetriever` | `packages/rag/retriever.py` |
| Task State Machine | `TaskStateMachine` | `packages/agent_core/state_machine.py` |
| Scheduler | `Scheduler` | `packages/scheduler/scheduler.py` |
| Approval Queue | `ApprovalQueue` | `packages/approval/queue.py` |
| Eval Harness | `EvalHarness` | `packages/evals/harness.py` |
| Trace Logger | `TraceLogger` | `packages/observability/trace.py` |
| Artifact Store | `ArtifactStore` | `packages/agent_core/artifacts.py` |

正文中使用概念名，代码中使用类名，目录中使用小写模块名。后续让 Codex 或 Claude Code 实现时，应优先保持这张表不变。
