# 参考资料与事实边界

本书以工程教学为主，不把外部项目的内部实现作为未经验证的事实。涉及公开项目和产品时，应区分三类内容：

1. **公开事实**：来自官方文档、README、官方博客或可验证产品行为；
2. **合理推断**：根据公开能力和常见工程模式推断可能需要的系统机制；
3. **架构启发**：本书提炼出的可迁移设计模式，不代表被分析对象一定使用同名实现。

## 主要公开资料

- OpenClaw GitHub README：描述 OpenClaw 是运行在自己设备上的个人 AI 助理，支持用户已有渠道、语音和 live Canvas，并强调 Gateway 是 control plane，product 是 assistant。
- Claude Code 官方文档：描述 Claude Code 是 agentic coding tool，可读取代码库、编辑文件、运行命令，并集成开发工具。
- OpenAI Codex web / cloud 文档：描述 Codex 可读、改、运行代码，并可在云端后台并行执行任务。
- OpenAI Codex CLI 文档：描述 Codex CLI 可在本地终端运行，并在选定目录中读、改、运行代码。

正式发布前，建议把这些资料整理成脚注或参考文献格式，并补充访问日期。
