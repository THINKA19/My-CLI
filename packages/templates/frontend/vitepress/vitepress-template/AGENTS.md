# AGENTS.md

## 项目概览
- **框架**：VitePress (Vue 3 + TypeScript)
- **包管理器**：`pnpm`

## 常用命令
- `pnpm docs:dev` — 启动开发预览
- `pnpm docs:build` — 构建静态文档
- `pnpm docs:preview` — 预览构建产物

## 目录结构
```text
.
├── .vitepress/
│   └── config.ts  # 主配置文件 (nav, sidebar)
└── docs/          # 文档源码 (.md)
```