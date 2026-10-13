# AGENTS.md - AI 协作开发指南

> 本文档为 AI 开发助手（如 GitHub Copilot、Cursor、Claude、ChatGPT 等）提供项目架构、规范与开发约束，确保 AI 生成的代码符合项目标准。

---

## 1. 项目概览

### 1.1 项目定位

基于 VitePress 构建的多语言文档站点，支持中文、英文、越南语三种语言。

### 1.2 架构特点

- ✅ **模块化配置**：结构与翻译完全分离
- ✅ **类型安全**：完整的 TypeScript 类型定义
- ✅ **配置验证**：开发环境自动验证配置完整性
- ✅ **多平台部署**：支持 GitHub Pages、Vercel、Cloudflare Pages、Docker

### 1.3 关键约束

⚠️ **严禁改动已完工配置：**

- 国际化配置（`.vitepress/config/locales/`）
- 图表组件（Mermaid 配置）
- Git Hooks（Husky）
- 环境变量配置（`.env.*` 文件）
- Docker 基础配置

---

## 2. 技术栈

### 2.1 核心框架

```json
{
  "runtime": "Node.js >= 18.0.0",
  "packageManager": "pnpm >= 11.22.0",
  "framework": "VitePress 2.0.0-alpha.20",
  "language": "TypeScript 5.7.3",
  "buildTool": "Vite 8.3.2"
}
```

### 2.2 开发工具

```json
{
  "linter": "ESLint 10.11.0 (@antfu/eslint-config)",
  "formatter": "ESLint (自动修复)",
  "typeChecker": "vue-tsc 3.3.11",
  "gitHooks": "Husky 9.1.7 + lint-staged 17.5.1",
  "commitLint": "@commitlint/cli 21.2.3 (conventional)"
}
```

### 2.3 部署平台

- **GitHub Pages** - 静态站点托管
- **Vercel** - 边缘部署
- **Cloudflare Pages** - CDN 加速
- **Docker** - 容器化部署（Nginx）
- **腾讯云/阿里云** - 镜像仓库