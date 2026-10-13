# VitePress 多语言文档站点

基于 VitePress、Vue 和 TypeScript 的文档项目，包含中文、英文、越南语页面与 Mermaid 图表支持。
提供 GitHub Pages、Vercel、Cloudflare Pages、OSS/COS 和 Docker 部署流程。

## 快速开始

推荐使用 Node.js 24，与部署环境保持一致；项目使用 pnpm 11（版本要求见 `package.json`）。

在项目根目录执行：

```bash
pnpm install
pnpm dev
```

访问终端显示的本地地址。

## 常用命令

| 命令 | 用途 |
| --- | --- |
| `pnpm dev` | 启动开发服务 |
| `pnpm build` | 构建静态站点，输出到 `dist/` |
| `pnpm preview` | 预览构建产物 |
| `pnpm lint` | 检查代码规范 |
| `pnpm lint:fix` | 自动修复代码规范问题 |
| `pnpm typecheck` | 检查 TypeScript 类型 |
| `pnpm test:i18n` | 检查多语言菜单、链接与文案类型 |

## 项目结构

- `src/zh/`、`src/en/`、`src/vi/`：各语言的 Markdown 文档。
- `.vitepress/config.ts`、`.vitepress/config/`：站点、导航、侧边栏和语言配置。
- `.vitepress/theme/`：主题和组件。
- `public/`：静态资源。
- `docker/`、`scripts/`、`.github/workflows/`：部署文件。
- `docs/ai/`：维护与部署说明。

## 部署与维护

部署流程按平台启用，需要配置实际域名及对应凭据。部署构建使用
`pnpm build:deploy`，读取 `VITE_BASE` 和 `VITE_SITE_URL`。
具体步骤见 [部署指南](docs/ai/DEPLOYMENT.md)，上线前参考 [部署检查清单](docs/ai/DEPLOYMENT_CHECKLIST.md)。

部署脚本的依赖与用法见 [脚本说明](scripts/deploy/README.md)。
开发维护见 [维护指南](docs/ai/MAINTENANCE.md)；AI 助手入口见 [AGENTS.md](AGENTS.md)。
