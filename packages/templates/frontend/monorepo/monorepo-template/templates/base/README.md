# my-monorepo

> 基于 pnpm workspace + Turborepo 的 monorepo。

## 环境要求

- Node.js >= 24（见 `.nvmrc`）
- pnpm 11.28.6

## 开始

```bash
pnpm install
pnpm dev
```

## 目录

```
apps/       可独立运行的应用
packages/   被应用或其他包引用的共享包
```

## 常用命令

| 命令                          | 说明                 |
| ----------------------------- | -------------------- |
| `pnpm dev`                    | 启动所有开发任务     |
| `pnpm build`                  | 按依赖顺序构建所有包 |
| `pnpm --filter <包名> <脚本>` | 只对某个包执行脚本   |

## 新增子项目

1. 在 `apps/frontend/`、`apps/backend/` 或 `packages/` 下新建目录，并添加 `package.json`
2. 内部依赖用 `workspace:*` 引用，例如 `"@scope/utils": "workspace:*"`
3. 需要被 Turbo 调度的任务（如 `build`、`dev`），要在该包的 `package.json` 里定义同名脚本

## 环境变量

复制 `.env.example` 为 `.env` 后按需修改，`.env` 不会被提交。
## 代码与提交规范

使用 ESLint + @antfu/eslint-config。运行 `pnpm lint` 检查，`pnpm lint:fix` 自动修复。

Git 仓库根目录安装依赖时自动启用 Husky；若先安装依赖再初始化 Git，请执行 `git init` 后运行 `pnpm prepare`。未初始化 Git 时跳过钩子安装。

提交前仅检查并修复暂存文件；提交消息遵循 Conventional Commits，例如 `feat: 添加功能`。CI 执行全量 Lint。
