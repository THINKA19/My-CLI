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



## v0.0.2 (2026-10-01) 

### 新增

* apps 应用包
* packages 共享包
* package.json  脚本命令
* pnpm-workspace.yaml  开启 workspace

## v0.0.3 (2026-10-01) 

### 新增

配置任务流水线

* turbo.json 文件

### 修改

package.json 文件

* 修改三个地方的 package.json 文件
* 根目录、packages/utils 和 apps/web