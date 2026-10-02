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

