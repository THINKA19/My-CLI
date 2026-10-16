# 维护指南

本目录存放生成后的 VitePress 项目的维护说明。脚手架 CLI 的说明位于模板外层，两者分别维护。

## 内容与配置

- 文档分别位于 `src/zh/`、`src/en/`、`src/vi/`，路由保留语言前缀；根首页跳转到 `/zh/`。
- 新增或移动页面时维护 frontmatter，并运行 `pnpm menus:generate`；独立校验使用 `pnpm menus:check`。
- 站点信息、SEO、搜索和语言配置位于 `.vitepress/config/`，主入口为 `.vitepress/config.ts`。
- 主题和 Mermaid 相关代码位于 `.vitepress/theme/`；公共静态资源位于 `public/`。

## 修改原则

按任务范围修改；需要调整语言、环境变量、Git Hooks 或部署配置时，确认相关影响，避免无关改动。
修改文档时同步检查内部链接和导航。修改程序后按影响范围运行 `pnpm lint`、`pnpm typecheck` 或 `pnpm build`；
遇到已有错误应说明实际结果，不将未执行或未通过的检查记录为成功。

依赖版本与命令以 `package.json` 为准，不在文档中重复维护全部工具版本。
生成菜单后，多语言专项测试使用 `node --test tests/i18n/config.test.mjs`，没有通用的 `pnpm test` 命令。
菜单与翻译的扩展约定见 [多语言配置说明](../../.vitepress/config/README.md)。

## 部署说明

构建使用 `pnpm build`，部署前设置 `VITE_BASE` 和 `VITE_SITE_URL`。
配置通过 Vite 的 `loadEnv` 读取环境文件；Node.js 配置阶段不使用 `import.meta.env`。

部署参数见 [部署指南](DEPLOYMENT.md)，上线检查见 [部署检查清单](DEPLOYMENT_CHECKLIST.md)。
