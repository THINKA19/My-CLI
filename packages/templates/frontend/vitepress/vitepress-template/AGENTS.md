# AGENTS.md

本文件为 AI 助手提供脚手架 CLI 的维护说明。此目录是 npm 包 `@dengzhibo/create-vitepress-template`，用于生成 VitePress 文档项目。

## 主要内容

- `bin/index.js`：CLI 入口，复制模板、还原点文件名称、设置项目名，并按需安装依赖。
- `template/`：生成项目的模板，包含文档源码、主题配置和部署文件；修改时同时遵循 `template/AGENTS.md`。
- `package.json`：CLI 命令、打包范围和发布配置。

## 常用命令

在当前目录执行：

- `pnpm help`：查看 CLI 用法。
- `node bin/index.js <项目名> [--install]`：生成项目，可选安装依赖。

文档站点的开发、构建和部署说明属于 `template/AGENTS.md`，不要与 CLI 的维护说明混用。
