# 脚手架内部架构设计说明

## create-turbo 脚手架

> 不要直接在 `create-turbo` 上二次开发，借鉴 Turborepo 的架构思想，但自己设计“脚手架层”。

`create-turbo` 不是一个独立的网站，而是一个 **NPM 脚手架工具（CLI 命令）**。它是著名前端部署平台 **Vercel** 旗下开源构建系统 **Turborepo** 的官方脚手架。

* 常用启动命令

```Bash
npx create-turbo@latest
# 或
pnpm dlx create-turbo@latest
# 或
yarn dlx create-turbo@latest
# 或
bunx create-turbo@latest
```



## v0.0.4 (2026-10-01) 

### 新增

```js
# 根目录下执行
node apps/web/index.js
```

* apps 应用包
* packages 共享包
* package.json  脚本命令
* pnpm-workspace.yaml  开启 workspace
* .npmignore 要放在子目录下，不是根目录

## v0.0.5 (2026-10-01) 

### 新增

配置任务流水线

* turbo.json 文件

### 修改

```js
# apps/web 文件夹下执行
pnpm dev
```

package.json 文件

* 修改三个地方的 package.json 文件
* 根目录、packages/utils 和 apps/web

## v0.1.0 (2026-10-02) 

### 新增

工程化基础配置

* .vscode 通用性，中等偏低
* .editorconfig 编辑器
* .env.example 环境变量
* .gitattributes Git相关
* .npmrc
* .nvmrc
* _gitignore
* AGENTS.md
* README.md

### 修改

* apps
* packages

## v0.2.0 (2026-10-02) 

### 新增

CICD 和 Docker

* .github
* docker
* _dockerignore

```plain
.github/
├── actions/
│   └── setup/
│       └── action.yml    # [复合 Action] 跨 Workflow 复用的基础环境初始化配置（配置 Node.js、pnpm 及其依赖缓存）
├── workflows/
│   ├── ci.yml            # [持续集成] 代码提交与 PR 质量门禁（运行代码检查、类型校验、单元测试及构建验证）
│   ├── deploy.yml        # [持续部署] 生产/预发环境自动化部署流程（如将 apps/web 部署至 Vercel、Cloudflare 或服务器）
│   └── release.yml       # [版本发布] 自动化语义化版本发布流程（结合Changesets自动打Tag、生成Changelog及发布 npm 包）
├── dependabot.yml        # [安全运维] GitHub 依赖自动更新配置（定时检测 package.json 及 Actions 版本并自动拉取 PR）
└── README.md             # [文档说明] CI/CD 架构与运维指南（说明环境变量/Secrets 配置、工作流触发机制及本地调试方法）
```

```plain
├── docker/
│   ├── frontend/
│   │   ├── Dockerfile          # 多阶段：dev / build / nginx 运行
│   │   └── nginx.conf
│   ├── backend/
│   │   └── Dockerfile          # 多阶段：dev / 生产运行
│   ├── compose.yml             # 公共配置
│   ├── compose.dev.yml         # 开发覆盖
│   ├── compose.prod.yml        # 生产覆盖
│   └── README.md
```

### 修改

* .npmrc 文件改成 _npmrc
* bin/index.js 文件修改
* package.json

```js
"scripts": {
  "docker:dev": "docker compose -f docker/compose.yml -f docker/compose.dev.yml up --build",
  "docker:prod": "docker compose -f docker/compose.yml -f docker/compose.prod.yml up -d --build",
  "docker:down": "docker compose -f docker/compose.yml down"
}
```

## v0.3.0 (2026-10-02)

> 写完后请先执行 `pnpm install && pnpm typecheck`，有报错把日志发给 AI 检查

### 新增 

TypeScript 

* tsconfig.base.json
* tsconfig.json

```plain
├── apps/
│   ├── frontend/
│   │   ├── vue/
│   │   │   ├── tsconfig.json
│   │   │   ├── tsconfig.app.json
│   │   │   └── tsconfig.node.json
│   │   │
│   │   └── react/
│   │       ├── tsconfig.json
│   │       ├── tsconfig.app.json
│   │       └── tsconfig.node.json
│   │
│   └── backend/
│       ├── node/
│       │   └── tsconfig.json
│       │
│       └── nest/
│           └── tsconfig.json
│
├── packages/
│   ├── ui/
│   │   └── tsconfig.json
│   ├── utils/
│   │   └── tsconfig.json
│   └── types/
│       └── tsconfig.json
│
├── tsconfig.json
├── tsconfig.base.json
│
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

### 修改

* package.json
* pnpm-workspace.yaml
* turbo.json
* .github/ci.yml
* .github/dependabot.yml
* .vscode/settings.json

