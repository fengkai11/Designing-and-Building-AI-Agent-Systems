# 从零构建 AI Agent 系统

**理论、架构、源码研究与工程实现**

在线阅读：<https://fengkai11.github.io/Designing-and-Building-AI-Agent-Systems/>

这是一本面向工程实践的 AI Agent 系统学习电子书。它不把 Agent 只当作提示词技巧，而是从能力边界、运行循环、工具系统、上下文工程、记忆、评估、可观测性和产品化落地等角度，系统拆解一个可用 Agent 系统应该如何设计、实现、调试和持续演进。

本书适合希望把 Agent 从 Demo 推向真实工程场景的开发者、架构师、技术负责人和高阶学习者。读完后，你应该能够更清楚地判断什么时候该用 Agent，如何设计 Agent Runtime，如何组织工具、记忆和知识库，如何评估 Agent 是否真的有用，以及如何从开源项目和产品级系统中提炼自己的实现方案。

## 本书内容

全书共 20 章，分为六个部分：

- **第一篇：重新理解 Agent**  
  建立 Agent 的基本判断力，理解它适合解决什么问题，也理解它不适合什么场景。
- **第二篇：Agent 核心机制**  
  讲解 Agent Loop、工具系统、上下文工程和 Planning，这是构建 Agent Runtime 的基础。
- **第三篇：记忆、知识库与长期任务**  
  讨论 Memory、RAG、知识库、长任务调度、恢复与状态管理。
- **第四篇：可控、安全、可评估的 Agent**  
  覆盖 Human-in-the-loop、Evaluation 和 Observability，让 Agent 行为可控、可测、可追踪。
- **第五篇：源码研究与架构模式**  
  通过 OpenClaw、Hermes、Claude Code、Codex 等项目和产品视角，学习如何阅读 Agent 源码并提炼架构。
- **第六篇：综合实战项目**  
  设计任务型研究 Agent、外贸客户开发 Agent、代码开发 Agent Mini 版，并讨论从 Demo 到产品的演进路径。

书中还包含 7 个附录，覆盖术语表、Prompt 模式、Tool Schema 示例、评估模板、源码阅读模板、90 天学习路线和 6 个月项目路线。

## 推荐阅读路径

如果你是第一次系统学习 Agent，建议按下面顺序阅读：

```text
第 1-3 章：建立 Agent 判断力
第 4-7 章：理解核心机制
第 8-13 章：进入长期任务、可控性与评估
第 14-16 章：学习源码阅读与 Runtime 设计
第 17-20 章：完成综合项目与产品化思考
```

如果你已经有 Agent 开发经验，可以直接从第 4 章、第 8 章或第 14 章进入，把前几章作为概念校准。

## 适合读者

- 已经会使用大模型 API，希望进一步构建 Agent 系统的开发者；
- 正在把 Agent Demo 改造成业务工具或内部平台的工程团队；
- 想系统理解工具调用、上下文管理、记忆、RAG、评估和可观测性的技术人员；
- 希望通过阅读开源项目提升 Agent 架构能力的学习者。

## 本地预览

本书使用 mdBook 构建。安装 mdBook 后，可以在本地预览：

```bash
./scripts/serve.sh
```

构建静态站点：

```bash
./scripts/build.sh
```

构建结果输出到 `book/`，该目录不提交到仓库。

## 发布方式

仓库已包含 GitHub Pages 自动部署 workflow：

```text
.github/workflows/deploy.yml
```

推送到 `main` 分支后，GitHub Actions 会构建 mdBook 并发布到 GitHub Pages。首次使用时，需要在仓库 `Settings -> Pages` 中把 Source 设置为 `GitHub Actions`。

## 版本

当前版本：`v1.0-mdbook`
