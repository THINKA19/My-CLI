# AGENTS.md

本项目是基于 VitePress、Vue 和 TypeScript 的多语言文档站点，支持中文、英文和越南语，使用 pnpm 管理依赖。

- `src/`：文档源码；`.vitepress/`：站点配置和主题；`public/`：静态资源。
- `docker/`、`scripts/`、`.github/workflows/`：构建与部署。
- 常用命令：`pnpm dev`、`pnpm build`、`pnpm preview`、`pnpm lint`、`pnpm typecheck`。
- 按任务范围修改，避免无关改动；涉及多语言页面时检查对应导航和侧边栏。

详细说明：[维护指南](docs/ai/MAINTENANCE.md)、[部署指南](docs/ai/DEPLOYMENT.md)、[部署检查清单](docs/ai/DEPLOYMENT_CHECKLIST.md)。
