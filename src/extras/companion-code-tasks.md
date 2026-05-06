# 配套代码工程任务书

本文件用于把书稿中的工程设计转成可交给 Codex / Claude Code / 其他代码 Agent 执行的任务。目标不是一次性做完完整商业产品，而是实现一个可运行、可测试、可扩展的 Mini Agent Runtime。

## 一、工程目标

生成一个独立代码仓库：

```text
agent-book-code/
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
├── sample_data/
├── tests/
└── README.md
```

## 二、第一阶段：Agent Loop 与 Tool Registry

交给代码 Agent 的提示词：

```markdown
请基于本仓库创建 Mini Agent Runtime v1。

要求：
1. 使用 Python；
2. 实现 AgentTask、AgentEvent、AgentAction、ToolResult、Artifact 等核心数据结构；
3. 实现 AgentLoop，支持最大步数、停止条件、错误退出；
4. 实现 ToolRegistry，支持工具注册、schema、风险等级、timeout、dry-run；
5. 提供 calculator、read_file、write_file 三个示例工具；
6. 添加 pytest 测试；
7. README 中说明如何运行 demo。
```

验收：

```bash
pytest
python -m projects.research_agent.demo
```

## 三、第二阶段：Context Manager 与 Memory Store

要求：

1. 实现 ContextManager，支持 system / task / memory / tool_result 分区；
2. 实现 MemoryStore，先用 JSON 或 SQLite；
3. 支持记忆写入、搜索、更新、删除；
4. 为记忆增加 type、tags、confidence、source、created_at 字段；
5. 测试上下文长度控制和记忆检索。

## 四、第三阶段：Approval Queue 与 Trace Logger

要求：

1. 实现 ApprovalQueue；
2. 高风险工具调用必须生成审批请求；
3. 实现 TraceLogger，记录每一步 action、tool_result、artifact；
4. 支持任务回放；
5. 添加外贸开发信审批 demo。

## 五、第四阶段：Research Agent Demo

要求：

1. 输入研究问题；
2. 用模拟搜索数据或本地 Markdown 数据源；
3. 输出结构化研究报告；
4. 标注来源和不确定性；
5. 保存 report artifact；
6. 用 EvalHarness 对报告打分。

## 六、第五阶段：Foreign Trade Agent Demo

要求：

1. 输入产品档案和目标国家；
2. 从 sample_data 中读取候选客户；
3. 执行客户分类、去重、评分；
4. 生成开发信草稿；
5. 进入 ApprovalQueue；
6. 保存 outreach history；
7. 输出 30 天试点指标样例。

## 七、第六阶段：Code Agent Mini Demo

要求：

1. 实现 CLI：`plan`、`apply`、`test`、`report`；
2. 限制文件读写在 repo 根目录；
3. 实现 shell 白名单；
4. 输出 patch 和 diff；
5. 支持 checkpoint 和 rollback；
6. 添加 repo prompt injection 防护测试。

## 八、总体验收标准

```text
[ ] pytest 全部通过
[ ] Research Agent 能生成报告 artifact
[ ] Foreign Trade Agent 能生成线索表和待审批开发信
[ ] Code Agent Mini 能生成计划、应用 patch、运行测试、输出 diff
[ ] 高风险工具不会自动执行
[ ] 所有任务都有 trace
[ ] README 能让新读者 10 分钟跑通 demo
```
