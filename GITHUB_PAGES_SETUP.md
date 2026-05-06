# GitHub Pages 发布说明

## 1. 创建仓库

在 GitHub 创建一个新仓库，例如：

```text
Designing-and-Building-AI-Agent-Systems
```

## 2. 上传文件

将本项目根目录下所有文件上传到仓库根目录。

推荐命令：

```bash
git init
git add .
git commit -m "init mdBook agent book"
git branch -M main
git remote add origin https://github.com/fengkai11/Designing-and-Building-AI-Agent-Systems.git
git push -u origin main
```

## 3. 修改 book.toml

将 `book.toml` 中的仓库地址替换成你的真实地址：

```toml
git-repository-url = "https://github.com/fengkai11/Designing-and-Building-AI-Agent-Systems"
edit-url-template = "https://github.com/fengkai11/Designing-and-Building-AI-Agent-Systems/edit/main/{path}"
site-url = "/Designing-and-Building-AI-Agent-Systems/"
```

如果后续更换仓库名，请同步修改 `site-url`。

## 4. 开启 GitHub Pages

进入：

```text
Settings → Pages
```

在 Source 中选择：

```text
GitHub Actions
```

## 5. 自动部署

之后每次 push 到 `main` 分支，都会自动执行：

```text
.github/workflows/deploy.yml
```

部署完成后，GitHub Actions 页面会显示访问链接。
