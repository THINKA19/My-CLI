# 工程化配置

## Eslint 代码规范

> @antfu/eslint-config  这是目前 Vue 社区最顶流的格式化与 Lint 方案。

* 步骤 1：安装依赖

```bash
pnpm add -D eslint @antfu/eslint-config
```

* 步骤 2：新建 `eslint.config.mjs`

```js
import antfu from '@antfu/eslint-config'

export default antfu()
```

* 步骤 3：在 `package.json` 中配置脚本
  * 运行 `npm run lint:fix` 即可自动修复并格式化全项目代码

```json
 "scripts": {
   "lint": "eslint .",
   "lint:fix": "eslint . --fix"
 }
```

* 步骤 4：工程化进阶配置（推荐）
  * 脚手架内置配置示例，按需要启用组件库与格式化插件：

```JavaScript
import antfu from '@antfu/eslint-config'

export default antfu({
  // 基础语言与框架支持（默认开启 Vue、TS、JS、JSON、Markdown 等）
  vue: true,
  typescript: true,
  markdown: true,

  // 开启代码格式化增强（集成 Prettier 格式化非 JS/TS 文件）
  formatters: {
    css: true,
    html: true,
    markdown: 'prettier',
  },

  // 覆盖/补充项目自定义规则
  rules: {
    'no-console': 'warn',
    'vue/multi-word-component-names': 'off',
  },

  // 忽略检查的文件/路径
  ignores: [
    '**/dist',
    '**/.vitepress/dist',
    '**/.vitepress/cache',
  ],
})
```

## Husky Git 勾子配置

* 1、安装依赖

```bash
# 1. 安装 husky 为开发依赖
pnpm add -D husky
```

* 2、配置 husky  文件 （每个项目，**几乎100%通用**）
  * 配置 **pre-commit** 钩子（**提交前检查**）
  * 配置 **commit-msg** 钩子（**提交信息校验**）

* 3、`package.json` 脚本配置

```js
"scripts": {
  "prepare": "husky",
}
```

* 4、初始化
  * Husky 依赖 Git，必须确保项目根目录下存在 `.git` 文件夹。

```bash
# 手动初始化 Husky 
pnpm prepare
```

## lint-staged 与 commitlint 配置

### 汇总

> 配合 Husky 实现**增量代码检查**（仅检查本次修改的文件）与 **Git 提交信息规范校验**。

* 1、安装依赖

```bash
# lint-staged
pnpm add -D lint-staged

# commitlint
pnpm add -D @commitlint/cli @commitlint/config-conventional
```

* 2、在 `package.json` 中添加 

```js
"lint-staged": {
    "*.{js,ts,vue,md,json}": "eslint --fix"
},
```

* 3、新建 `commitlint.config.js`

```JavaScript
export default {
  extends: ['@commitlint/config-conventional'],
}
```

### lint-staged（增量代码校验）

> 仅对 `git add` 暂存区的文件运行 ESLint，大幅提升提交效率。

* 步骤 1：安装依赖

```Bash
pnpm add -D lint-staged
```

* 步骤 2：配置 `package.json`

在 `package.json` 中添加 `lint-staged` 配置项：

```JSON
"lint-staged": {
   "*.{js,ts,vue,md,json}": "eslint --fix"
},
```

* 步骤 3：修改 `.husky/pre-commit`

将 `.husky/pre-commit` 文件中的内容改为：

```Bash
exec pnpm exec lint-staged
```

### commitlint（提交信息规范）

> 校验 `git commit -m "..."` 的消息格式，强制遵循 Angular 规范（如 `feat: ...`, `fix: ...`）。

* 步骤 1：安装依赖

```Bash
pnpm add -D @commitlint/cli @commitlint/config-conventional
```

* 步骤 2：新建 `commitlint.config.js`

在项目根目录新建配置文件：

```JavaScript
export default {
  extends: ['@commitlint/config-conventional'],
}
```

* 步骤 3：接入 `.husky/commit-msg`

创建并写入 `.husky/commit-msg` 钩子文件：

```Bash
exec pnpm exec commitlint --edit "$1"
```

* 步骤 4：示例提交验证

❌ **错误提交**（触发拦截）：

```Bash
git commit -m "修改了登录功能"
```

✅ **正确提交**（顺利通过）：

```Bash
git commit -m "fix: 修复登录页二次点击不跳转问题"
```



# 脚手架模板集合

> 个人项目脚手架模板集合仓库 - 用于集中管理代码，每个包独立发布

## 包列表

### Frontend 模板

| 包名 | 版本 | 描述 | 路径 |
|------|------|------|------|
| [@dengzhibo/vitepress-template](https://npmjs.com/package/@dengzhibo/vitepress-template) | ![npm](https://img.shields.io/npm/v/@dengzhibo/vitepress-template) | VitePress 文档脚手架 | `packages/templates/frontend/vitepress/vitepress-template` |
| @dengzhibo/vite-template | - | Vite 项目脚手架（开发中） | `packages/templates/frontend/vite/vite-template` |
| @dengzhibo/webpack-template | - | Webpack 项目脚手架（开发中） | `packages/templates/frontend/webpack/webpack-template` |

### Backend 模板

| 包名 | 版本 | 描述 | 路径 |
|------|------|------|------|
| @dengzhibo/nest-template | - | Nest.js 项目脚手架（开发中） | `packages/templates/node/nest/nest-template` |
| @dengzhibo/egg-template | - | Egg.js 项目脚手架（开发中） | `packages/templates/node/egg/egg-template` |
| @dengzhibo/hono-template | - | Hono 项目脚手架（开发中） | `packages/templates/node/hono/hono-template` |

## 使用方式

每个包都是独立的 npm 包，可以直接使用：

```bash
# 创建 VitePress 项目
npx @dengzhibo/vitepress-template

# 创建 Nest.js 项目（开发中）
npx @dengzhibo/nest-template
```

## 仓库结构说明

这是一个**代码集中管理仓库**，但**不是 Monorepo**：

- ✅ 所有模板代码集中在一个 Git 仓库
- ✅ 每个包完全独立，互不依赖
- ✅ 每个包独立开发、独立发布
- ✅ 每个包有自己的版本号
- ❌ 不使用 workspace
- ❌ 不统一发布

## 开发指南

### 开发某个包

```bash
# 1. 进入包目录
cd packages/templates/frontend/vitepress/vitepress-template

# 2. 安装依赖（如果需要）
pnpm install

# 3. 测试 CLI
node ./bin/cli.js

# 4. 打包测试
pnpm pack --dry-run
```

### 发布某个包

```bash
# 1. 进入包目录
cd packages/templates/frontend/vitepress/vitepress-template

# 2. 更新版本号
npm version patch  # 或 minor、major

# 3. 发布到 npm
npm publish --access public

# 4. 提交版本变更
git add package.json
git commit -m "chore(vitepress): release v0.0.2"
git push
```

### Git Commit 规范

由于多个包在同一个仓库，commit 信息请标注包名：

```bash
git commit -m "feat(vitepress): 添加 Docker 支持"
git commit -m "fix(nest): 修复环境变量问题"
git commit -m "docs(vite): 更新 README"
```

## 根目录说明

根目录只包含开发工具配置，不会发布到 npm：

- `.husky/` - Git hooks 配置
- `eslint.config.js` - ESLint 配置（所有包共享）
- `commitlint.config.js` - Commit 信息校验
- `package.json` - 仅用于开发工具依赖

## 📄 License

MIT

---


