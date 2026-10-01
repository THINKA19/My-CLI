# CLI 开发与维护指南

## 项目定位
本项目是一个 Node.js CLI 脚手架工具（`@dengzhibo/create-monorepo-template`），用于快速生成 Monorepo 初始模板。

## 开发规范
- 源码核心逻辑位于 `bin/` 目录。
- 模板资源全量放置在 `template/` 目录下。
- 修改 `template/` 内的文件时，切勿在 `template` 内部进行 `pnpm install` 产生 `node_modules`。

## 关键命令
- 本地打包测试：`pnpm pack --dry-run`（确保产物不包含任何 `node_modules`）