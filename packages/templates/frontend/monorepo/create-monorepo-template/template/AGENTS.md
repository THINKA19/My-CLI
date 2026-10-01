# Monorepo 项目 AI 开发指南

## 架构说明
- 本项目是基于 **pnpm workspaces** 和 **Turborepo** 搭建的 Monorepo 工程。
- `apps/*`：应用层目录（如 `apps/web`）。
- `packages/*`：公共基础库与工具库（如 `@repo/utils`）。

## Monorepo 开发规范
- **包管理器**：严格使用 `pnpm`，禁止使用 `npm` 或 `yarn`。
- **依赖安装规则**：
  - 安装到根目录：`pnpm add <包名> -w`
  - 安装到指定子包：`pnpm --filter <子包名> add <包名>`

## 常用命令
- **本地开发**：`pnpm dev`（通过 Turbo 并行启动所有开发服务）
- **拓扑打包**：`pnpm build`（通过 Turbo 按依赖顺序进行打包）
- **类型检查**：`pnpm check-types`

## 代码风格
- 项目全面开启 **ES Modules**（`"type": "module"`）。
- 模块导出遵循现代 Node.js Export Maps（即 `package.json` 中的 `exports` 字段）。