# my-monorepo

> 基于 pnpm workspace + Turborepo 的 monorepo。

## 环境要求

- Node.js >= 24（见 `.nvmrc`）
- pnpm >= 10

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

1. 在 `apps/` 或 `packages/` 下新建目录，并添加 `package.json`
2. 内部依赖用 `workspace:*` 引用，例如 `"@scope/utils": "workspace:*"`
3. 需要被 Turbo 调度的任务（如 `build`、`dev`），要在该包的 `package.json` 里定义同名脚本

## 环境变量

复制 `.env.example` 为 `.env` 后按需修改，`.env` 不会被提交。