# 从零构建 AI Agent 系统

这是一本使用 mdBook 构建的 AI Agent 系统学习教程。

副标题：**理论、架构、源码研究与工程实现**

## 内容结构

本书包含：

- 第 1–20 章完整书稿；
- 7 个附录；
- 插图索引、练习汇总、代码目录说明；
- 10 张核心结构图；
- mdBook 构建配置；
- GitHub Pages 自动部署 workflow。

## 本地预览

安装 mdBook：

```bash
cargo install mdbook
```

本地启动：

```bash
mdbook serve --open
```

构建静态站点：

```bash
mdbook build
```

构建结果会输出到：

```text
book/
```

## GitHub Pages 发布

本仓库已经包含 GitHub Actions 配置：

```text
.github/workflows/deploy.yml
```

使用方式：

1. 新建 GitHub 仓库；
2. 上传本项目全部文件；
3. 在仓库 Settings → Pages 中选择 GitHub Actions；
4. push 到 `main` 分支后自动构建并部署。

## 修改仓库地址

请打开 `book.toml`，把下面两项替换成你的真实仓库地址：

```toml
git-repository-url = "https://github.com/fengkai11/Designing-and-Building-AI-Agent-Systems"
edit-url-template = "https://github.com/fengkai11/Designing-and-Building-AI-Agent-Systems/edit/main/{path}"
site-url = "/Designing-and-Building-AI-Agent-Systems/"
```

如果后续更换仓库名，也要同步修改 `site-url`。

## 推荐阅读路径

首次阅读建议顺序：

```text
第 1–3 章：建立 Agent 判断力
第 4–7 章：理解核心机制
第 8–13 章：进入长期任务、可控性与评估
第 14–16 章：源码研究与 Runtime 设计
第 17–20 章：综合项目与产品化
```

## 图片说明

插图统一存放在：

```text
src/figures/
```

章节中使用相对路径引用，mdBook 构建时会自动处理。

## 当前版本

```text
v1.0-mdbook
```

这是适合上传 GitHub 并用 mdBook 构建的电子书项目结构版本。
