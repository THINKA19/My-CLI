# @dengzhibo/create-monorepo-template

> 🚀 基于 **pnpm Workspace** + **Turborepo** 的企业级全栈 Monorepo 项目脚手架，开箱即用支持 Vue 3、React、Node.js 及共享基础库。

---

## ✨ 核心特性

* 📦 **现代 Monorepo 架构**：采用 `pnpm workspace` 组织结构，原生支持依赖共享与版本锁定。
* ⚡ **极速增量构建**：内置 **Turborepo**，提供智能任务调度与本地缓存，极大地提升构建与开发效率。
* 🌐 **多技术栈全覆盖**：
  * `apps/vue-app`：Vue 3 + Vite + TypeScript 前端应用
  * `apps/react-app`：React + Vite + TypeScript 前端应用
  * `apps/node-api`：Node.js 后端服务 API
* 共享基础包 (`packages/`)：
  * `packages/tsconfig`：通用的 TypeScript 继承配置
  * `packages/eslint-config`：统一的团队规范代码检查
  * `packages/utils`：全栈共享工具函数库

---

## 🚀 快速使用

### 1. 创建新 Monorepo 项目

使用 `pnpm create`（推荐）：
```sh
pnpm create @dengzhibo/monorepo-template my-monorepo
```