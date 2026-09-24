# Elsanna · ATE 工程知识库网站

本仓库使用 Quartz 4.5.2 构建 Obsidian 风格的工程知识库网站，部署地址为 <https://s2mp1e.github.io/>。

## 内容结构

- `content/`：网站发布的中文 Markdown 知识库内容。
- `legacy-site/`：原 Hexo 静态网站的完整备份，保存 2022 年文章、页面资源和原链接。
- `quartz/`：Quartz 网站生成器源码。
- `.github/workflows/deploy.yml`：构建网站并发布到 `main` 分支，沿用现有 GitHub Pages 分支发布方式。

## 本地预览

需要 Node.js 22 或更高版本。在仓库目录运行：

```bash
npm ci
node quartz/bootstrap-cli.mjs build --serve
```

本地预览地址：`http://localhost:8080`。

## 发布

将网站与笔记更新推送到 `codex/quartz-site-migration` 分支后，GitHub Actions 会构建 Quartz，并把生成文件与旧文章归档发布到 `main` 分支；现有 GitHub Pages 仍从 `main` 根目录读取。

原始 Obsidian 知识库仓库保持独立；此仓库存放用于网站发布的笔记副本。


