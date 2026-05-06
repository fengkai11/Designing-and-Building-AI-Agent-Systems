# 附录 A：Agent 术语表

本附录用于统一全书术语。Agent 领域概念混用非常常见，术语不清会直接导致系统设计混乱。


## 术语命名约定

为了避免正文、代码和目录之间出现混乱，本书采用以下命名约定：

| 场景 | 写法 | 示例 |
|---|---|---|
| 正文概念 | 英文词组，首字母大写或按惯例书写 | Tool Registry, Context Manager, Memory Store |
| Python 类名 | PascalCase | `ToolRegistry`, `ContextManager`, `MemoryStore` |
| Python 函数/变量 | snake_case | `run_task`, `tool_result`, `approval_queue` |
| 包和目录 | snake_case 或语义复数 | `packages/tools`, `packages/evals`, `projects/code_agent_mini` |
| 中文解释 | 首次出现时中英并列，后续优先使用英文术语 | 工具注册表（Tool Registry） |

本书统一使用以下核心术语：

```text
Agent Runtime
Agent Loop
Planner
Executor
Tool Registry
Context Manager
Memory Store
RAG Retriever
Task State Machine
Scheduler
Approval Queue
Eval Harness
Trace Logger
Artifact Store
Workbench
```

其中 `Workbench` 统一表示面向用户的工作台；`Dashboard` 只在强调指标看板时使用；`Task State Machine` 表示任务状态机；代码对象可以命名为 `TaskState`。

## Agent

围绕目标进行多步骤执行的系统。它通常具备任务理解、上下文管理、工具调用、状态维护、结果评估和必要的人类协同能力。Agent 不是单独的大模型，也不是一个 prompt。

## Chatbot

以对话为主要交互形式的系统。Chatbot 可以使用大模型，也可以调用工具，但如果它不围绕目标持续执行任务，就不应简单称为 Agent。

## Tool Calling

模型根据上下文选择并调用外部函数或 API 的能力。Tool Calling 是 Agent 的组成部分，但一次工具调用不等于 Agent。

## Agent Loop

Agent 的执行循环，通常包含观察、思考、行动、记录、判断是否停止等步骤。典型形式包括 Observe → Think → Act → Observe。

## ReAct

Reasoning and Acting 的组合模式。模型一边推理，一边决定下一步动作，适合探索型任务，但需要良好的停止条件和工具约束。

## Planner / Executor

规划器和执行器分离的架构。Planner 负责拆解任务和制定计划，Executor 负责按计划调用工具、处理结果和反馈状态。

## Tool Registry

工具注册表，保存系统可用工具的名称、描述、参数 schema、风险等级、执行函数和权限策略。

## Tool Schema

工具的结构化描述，通常包括工具名、用途、参数类型、必填字段、返回值格式和错误类型。好的 schema 可以降低模型误用工具的概率。

## Context Engineering

围绕模型上下文窗口进行的信息选择、排序、压缩和注入。上下文工程决定模型在当前步骤“看见什么”。

## System Prompt

系统级约束，描述模型角色、边界、禁止事项和全局行为规则。它通常比用户输入优先级更高。

## Developer Prompt

开发者级指令，用于规定系统实现约束、工具使用规则、输出格式和安全策略。

## Scratchpad

Agent 执行过程中的临时工作区，用于保存中间推理、工具结果摘要和下一步计划。生产系统中不一定直接暴露给用户。

## Memory

跨步骤或跨任务保存的信息。Memory 可以包括用户偏好、任务历史、领域知识、经验总结和结构化状态。

## Session Memory

当前会话中的记忆，通常只在一次对话或一次任务中有效。

## Long-term Memory

跨会话保存的长期信息，必须考虑准确性、权限、更新时间、删除和污染问题。

## RAG

Retrieval-Augmented Generation，检索增强生成。它通过检索外部文档来增强模型回答。RAG 主要解决知识访问问题，不等同于 Agent 记忆。

## Task State

任务执行状态，例如待执行、运行中、等待审批、失败、已完成、已取消。长任务 Agent 必须显式管理状态。

## Checkpoint

执行过程中的保存点，用于失败恢复、回滚和复盘。

## Scheduler

调度系统，用于定时、排队、重试和触发任务。

## Human-in-the-loop

人机协同机制。系统在关键节点请求人类确认、补充、修改或接管。

## Approval Queue

审批队列，用于存放需要人工确认的高风险动作，例如发送邮件、修改代码、删除文件、更新数据库。

## Evaluation

评估系统，用于判断 Agent 是否完成任务、是否安全、是否稳定、成本是否可接受。

## Observability

可观测性，指系统可以记录、追踪、回放和分析 Agent 行为，包括模型调用、工具调用、状态变化、错误和成本。

## Trace

一次 Agent 执行的完整轨迹。它由多个 step、span 或 event 组成。

## Replay

根据历史 trace 重放 Agent 执行过程，用于排查问题和复盘失败。

## Prompt Injection

外部内容诱导模型忽略原有指令或泄露信息的攻击方式。浏览器 Agent、RAG Agent 和代码 Agent 都需要防范。

## Dry-run

试运行模式。系统展示将要执行的动作和影响，但不真正产生副作用。

## Runtime

Agent 运行时，负责组织模型、工具、上下文、状态、审批、日志和评估等模块。

## Multi-agent

多个 Agent 分工协作的架构。它不是越多越好，只有当职责边界清晰、通信成本可控时才有价值。
