# 附录 F：90 天学习路线

这是一条面向实践的 90 天路线。目标不是读完所有材料，而是在 90 天内形成能独立设计并实现小型 Agent 系统的能力。

## 第 1–10 天：建立判断力

阅读：第 1–3 章。

任务：

1. 整理 20 个你熟悉的任务；
2. 判断它们适合函数、工作流还是 Agent；
3. 为其中 3 个任务画出 Agent 能力模型；
4. 写一页纸总结：你最想做的 Agent 是什么，为什么它适合 Agent。

交付物：

```text
01-task-classification.md
02-agent-capability-map.md
03-my-agent-one-page.md
```

## 第 11–25 天：实现最小 Agent Loop

阅读：第 4–5 章。

任务：

1. 实现最小 Agent Loop；
2. 实现 Tool Registry；
3. 实现 3 个低风险工具；
4. 增加最大步数、错误处理和日志；
5. 写 5 个测试任务。

交付物：

```text
mini-agent-runtime/v1_agent_loop/
```

## 第 26–35 天：上下文与规划

阅读：第 6–7 章。

任务：

1. 实现 Context Manager；
2. 支持系统约束、任务目标、历史记录、工具结果分区；
3. 实现 ReAct 和 Planner-Executor 两种模式；
4. 比较同一任务在两种模式下的差异。

交付物：

```text
context-manager-demo.md
planner-executor-demo.md
```

## 第 36–50 天：记忆、RAG 与长任务

阅读：第 8–10 章。

任务：

1. 设计 Memory schema；
2. 实现简单 Memory Store；
3. 实现 Markdown 文档 RAG；
4. 实现 Task State；
5. 支持暂停、恢复和 checkpoint。

交付物：

```text
mini-agent-runtime/v2_memory_rag_scheduler/
```

## 第 51–65 天：安全、审批、评估、可观测

阅读：第 11–13 章。

任务：

1. 为工具增加风险等级；
2. 实现 Approval Queue；
3. 实现 trace 日志；
4. 构造 10 条 eval case；
5. 生成一次评估报告。

交付物：

```text
mini-agent-runtime/v3_safe_evaluable_runtime/
eval-report-001.md
```

## 第 66–75 天：源码阅读

阅读：第 14–16 章。

任务：

1. 选择一个开源 Agent 项目；
2. 按附录 E 模板阅读源码；
3. 画出执行链路；
4. 提炼 5 个可借鉴设计；
5. 提炼 3 个不适合照搬的设计。

交付物：

```text
source-code-reading-report.md
my-agent-runtime-design.md
```

## 第 76–90 天：完成一个综合项目

阅读：第 17–20 章。

在以下项目中选择一个：

1. 任务型研究 Agent；
2. 外贸客户开发 Agent；
3. 代码开发 Agent Mini 版；
4. 你自己的业务 Agent。

任务：

1. 写一页纸产品合同；
2. 设计任务流程；
3. 设计工具和权限；
4. 实现最小闭环；
5. 跑 10 条评估任务；
6. 写复盘报告。

交付物：

```text
final-project/
├── product-contract.md
├── architecture.md
├── source-code/
├── eval-cases.yaml
└── retrospective.md
```

## 每周复盘问题

```text
[ ] 本周我真正实现了什么闭环？
[ ] 哪个概念我只是“看懂了”，但还不能实现？
[ ] 哪个模块最容易失控？
[ ] 哪个工具应该加审批？
[ ] 哪个输出需要评估？
[ ] 下周最小可交付物是什么？
```
