# VitePress 脚手架搭建

## 根目录详解

### 根目录文件详解

| 文件/目录                                                    | 必要程度           | 作用                                                         |
| ------------------------------------------------------------ | ------------------ | ------------------------------------------------------------ |
| `.gitignore`                                                 | 必须               | 已提过,补上 `node_modules`、`docs/.vitepress/dist`、`docs/.vitepress/cache`、`.env` |
| `.editorconfig`                                              | 强烈推荐           | 跨编辑器统一缩进/换行/编码,和 ESLint 互补而非替代            |
| `.nvmrc`(或 `.node-version`)                                 | 强烈推荐           | 锁定 Node 版本,配合 CI 和团队本地环境一致                    |
| `.npmrc`                                                     | 推荐               | 锁定包管理器行为;企业内部场景常见配置:私有 registry 地址、`engine-strict=true`、pnpm 的 `shamefully-hoist` 等 |
| `.env.example`                                               | 视情况             | 只有当 `config.js` 需要读取外部变量时才需要(比如 Algolia search key、内部 CMS 接口地址、分析统计 ID)。**真正的 `.env` 不进仓库**,只提供 `.env.example` 作为模板,`.env` 本身写进 `.gitignore` |
| `.gitattributes`                                             | 推荐               | 统一换行符(LF/CRLF),团队跨平台协作(Windows/Mac)时能省很多事  |
| `eslint.config.js`                                           | 推荐(按上面结论)   | lint 规范                                                    |
| `.husky/pre-commit` + `commitlint.config.js` + `lint-staged` 配置 | 推荐(团队协作场景) | 提交前自动 lint/format,commit message 规范化(配合 Conventional Commits,后续还能自动生成 CHANGELOG) |
| `.vscode/settings.json` + `.vscode/extensions.json`          | 推荐               | 统一团队编辑器体验(保存自动修复、推荐安装 ESLint/Vue 插件),减少"我本地没这个报错"的扯皮 |
| `tsconfig.json`                                              | 视选项             | 如果 CLI 问答里选了"使用 TypeScript",需要生成                |
| `LICENSE`                                                    | 视场景             | 开源脚手架/开源文档站必须;纯内部项目可省略或换成公司内部协议声明 |
| `README.md`                                                  | 已提过             | 项目说明                                                     |
| `CONTRIBUTING.md`                                            | 可选               | 面向多人协作或开源场景,写清楚分支策略、提交规范              |
| `pnpm-workspace.yaml`                                        | 可选               | 只有当脚手架要支持"一个仓库多个文档站"(monorepo)时才需要     |

### 完整根目录结构

```plain
├─ .husky/                  # Git Hooks 配置目录
│  └─ pre-commit            # 代码提交前触发的钩子脚本（常用于自动运行 Lint 和格式化）
├─ .vscode/                 # VSCode 项目专属配置目录
│  ├─ settings.json         # VSCode 工作区设置（如保存自动格式化、缩进等）
│  └─ extensions.json       # 团队推荐安装的 VSCode 插件列表
├─ docs/                    # VitePress 文档项目根目录
│  ├─ .vitepress/           # VitePress 站点核心配置与自定义主题目录
│  │  ├─ config.js          # VitePress 主配置文件（配置导航栏、侧边栏及 srcDir 指向）
│  │  └─ theme/             # 主题定制目录
│  │     ├─ index.js        # 主题入口文件（注册自定义组件与全局配置）
│  │     ├─ style.css       # 站点全局与重置样式表
│  │     └─ components/     # 可在 Markdown 中直接调用的自定义 Vue 组件
│  └─ src/                  # 文档源文件目录（配置了 srcDir: 'src'）
│     ├─ public/            # 静态资源目录（存放图标、图片等静态文件）
│     ├─ index.md           # 文档站点首页
│     ├─ api-examples.md    # API 使用示范文档
│     └─ markdown-examples.md # Markdown 语法与组件渲染示范文档
├─ .editorconfig            # 跨编辑器/IDE 代码统一格式配置文件
├─ .env.example             # 环境变量示例文件（供复制为 .env 使用）
├─ .gitattributes           # Git 属性配置（控制换行符、文件类型判定等）
├─ .gitignore               # Git 提交忽略清单（忽略 node_modules、构建产物等）
├─ .npmrc                   # NPM 包管理器配置文件（镜像源、依赖策略设置）
├─ .nvmrc                   # 指定项目运行所需的 Node.js 版本
├─ commitlint.config.js     # Git 提交信息规范校验配置文件
├─ eslint.config.js         # ESLint 代码规范与语法检查配置文件
├─ LICENSE                  # 项目开源许可协议声明文件
├─ package.json             # 项目元数据、依赖包及脚本命令配置文件
├─ README.md                # 项目介绍与使用说明文档
├─ scaffold.config.json     # 脚手架/生成器自定义配置文件
└─ tsconfig.json            # TypeScript 编译配置与路径映射文件         
```



## 创建项目

### 常用命令

* 环境要求
  * Node.js 版本见 `.nvmrc`
  * 包管理器:pnpm

* 常用命令

```bash
# 安装依赖
pnpm install

# 本地开发
pnpm docs:dev

# 构建产物
pnpm docs:build

# 本地预览构建结果
pnpm docs:preview

# 代码检查 / 自动修复
pnpm lint
pnpm lint:fix
```

### 安装命令

* 1、安装命令

```bash
pnpm init
pnpm add -D vitepress@next
pnpm vitepress init
```

* 2、源文件目录配置
  * md 文件都放到了src 文件夹下
  * 新增 .gitignore 文件

### 基础配置

```bash
pnpm add vue
pnpm add -D @types/node typescript@5 vue-tsc@2
```

* 1、VSCode 项目专属配置目录
  * .vscode 配置文件夹
* 2、静态资源目录
  * public
* 3、编辑器设置
  * .editorconfig 文件
  * .gitattributes 文件

* 4、环境变量配置
  
  * .env.example 文件
  
  * .env.development 文件
  * .env.production 文件
  
* 5、版本管理
  
  * .npmrc 文件
  * .nvmrc 文件
  
* 6、Typescript 配置
  
  *  tsconfig.json 文件
  
* 7、版权设置

  * LICENSE



## 格式化

### antfu/eslint-config 配置指南

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

### Husky 使用与配置指南

* **1、核心配置**

1、安装依赖

```bash
# 1. 安装 husky 为开发依赖
pnpm add -D husky
```

2、配置 husky  文件 

* .husky 文件

3、`package.json` 脚本配置

```js
"scripts": {
  "prepare": "husky",
}
```

* **2、核心工作原理**

```
git commit 命令触发 
   └── .husky/pre-commit 脚本执行
          ├── 运行 pnpm run lint (代码检查)
          └── 通过后才允许正常提交
```

* **3、快速初始化与安装**

在项目根目录下，执行以下步骤完成 Husky 的配置：

第一步：安装依赖与初始化 Husky

```Bash
# 1. 安装 husky 为开发依赖
pnpm add -D husky

# 2. 初始化 husky（自动生成 .husky/ 目录并配置 git hooks 路径）
npx husky init
```

> **提示**：执行 `npx husky init` 后，会自动在 `package.json` 的 `scripts` 中添加 `"prepare": "husky"`。这能保证团队其他人安装依赖（执行 `pnpm install`）时，自动触发 Husky 的钩子安装。

* **4、常用 Hook 配置示例**

**1.配置 pre-commit 钩子（提交前检查）：**代码提交前自动运行代码规范校验。

打开自动生成的 `.husky/pre-commit` 文件，将默认内容替换为你需要执行的脚本：

```Bash
# .husky/pre-commit
pnpm run lint
```

*若项目配置了 `lint-staged`，建议替换为：*

```Bash
npx lint-staged
```

**2.配置 commit-msg 钩子（提交信息校验）：**校验 Git Commit 信息是否符合规范。

新建或添加 `.husky/commit-msg` 文件，用于结合 `commitlint` 检查提交信息格式：

```Bash
# 建立 commit-msg 钩子文件
echo "npx --no -- commitlint --edit \$1" > .husky/commit-msg
```

* **5、团队协作注意事项与常见问题**

1. 权限问题（Linux / macOS）

如果在提交代码时提示 `permission denied` 或钩子未触发，需要赋予钩子可执行权限：

```Bash
chmod +x .husky/pre-commit
chmod +x .husky/commit-msg
```

2. 临时跳过 Hooks 检查

在某些特殊紧急情况下（如急需 Commit 保存代码），可以加上 `--no-verify` 参数跳过检查：

```Bash
git commit -m "fix: 紧急修复" --no-verify
```

3. 未初始化 Git 仓库的报错

Husky 依赖 Git，必须确保项目根目录下存在 `.git` 文件夹。如果是新建项目，请先运行 `git init` 再进行初始化。



### lint-staged 与 commitlint 配置指南

> 配合 Husky 实现**增量代码检查**（仅检查本次修改的文件）与 **Git 提交信息规范校验**。

* 核心配置
  * 安装依赖

```bash
# lint-staged
pnpm add -D lint-staged
# commitlint
pnpm add -D @commitlint/cli @commitlint/config-conventional
```

* 在 `package.json` 中添加 

```js
"lint-staged": {
    "*.{js,ts,vue,md,json}": "eslint --fix"
},
```

* 新建 `commitlint.config.js`

```JavaScript
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // 规定 type 类型
    'type-enum': [
      2,
      'always',
      [
        'feat',     // 新功能
        'fix',      // 修复 bug
        'docs',     // 文档变更
        'style',    // 代码格式（不影响代码运行的变动）
        'refactor', // 重构（既不修复 bug 也不添加新功能）
        'perf',     // 性能优化
        'test',     // 增加测试
        'chore',    // 构建过程或辅助工具变动
        'revert',   // 回退
        'build',    // 打包/发布相关
      ],
    ],
    // 强制 subject 使用小写
    'subject-case': [0],
  },
}
```

#### 模块 1：lint-staged（增量代码校验）

仅对 `git add` 暂存区的文件运行 ESLint，大幅提升提交效率。

* 步骤 1：安装依赖

```Bash
pnpm add -D lint-staged
```

* 步骤 2：配置 `package.json`

在 `package.json` 中添加 `lint-staged` 配置项：

```JSON
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx,vue,md,json}": [
      "eslint --fix"
    ]
  }
}
```

* 步骤 3：修改 `.husky/pre-commit`

将 `.husky/pre-commit` 文件中的内容改为：

```Bash
npx lint-staged
```

#### 模块 2：commitlint（提交信息规范）

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
  rules: {
    // 规定 type 类型
    'type-enum': [
      2,
      'always',
      [
        'feat',     // 新功能
        'fix',      // 修复 bug
        'docs',     // 文档变更
        'style',    // 代码格式（不影响代码运行的变动）
        'refactor', // 重构（既不修复 bug 也不添加新功能）
        'perf',     // 性能优化
        'test',     // 增加测试
        'chore',    // 构建过程或辅助工具变动
        'revert',   // 回退
        'build',    // 打包/发布相关
      ],
    ],
    // 强制 subject 使用小写
    'subject-case': [0],
  },
}
```

* 步骤 3：接入 `.husky/commit-msg`

创建并写入 `.husky/commit-msg` 钩子文件：

```Bash
echo "npx --no -- commitlint --edit \$1" > .husky/commit-msg
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



## CI/CD（持续集成/持续部署）

### 目录结构

```Plaintext
├─ docker/                    # 🐳 Docker 部署目录
│  ├─ Dockerfile              # VitePress 多阶段镜像构建脚本
│  ├─ docker-compose.yml      # Docker 容器编排服务配置
│  ├─ nginx.conf              # Nginx 静态服务与缓存优化配置
│  └─ README.md               # Docker 部署与镜像构建说明
├─ .github/                   # 🤖 GitHub 自动化工作流
│  └─ workflows/
│     ├─ ci.yml               # PR / Push 时的代码规范校验与构建测试
│     ├─ deploy.yml           # 主分支提交自动打包镜像并部署至服务器
│     └─ release.yml          # 打 Tag 发版时自动创建 GitHub Release
└─ .dockerignore              # ⚠️ 根目录必需！构建 Docker 镜像时的排除清单
```

`package.json` 配置

```js
 "scripts": {
    "docker:build": "docker build -f docker/Dockerfile -t my-vitepress-docs:latest .",
    "docker:up": "docker compose -f docker/docker-compose.yml up -d --build",
    "docker:down": "docker compose -f docker/docker-compose.yml down",
    "docker:logs": "docker compose -f docker/docker-compose.yml logs -f"
  }
```



## `config` 配置

### 基础配置

* 目录结构

```
docs/
└─ .vitepress/
   ├─ config/                   # 📁 拆分后的配置文件独立目录
   │  ├─ site.ts                # 1. 基础站点配置 (title, description, lang, base, srcDir 等)
   │  ├─ seo.ts                 # 2. SEO 与 Head 配置 (meta, openGraph, favicons 等)
   │  ├─ theme.ts               # 3. 主题细节配置 (logo, footer, editLink, socialLinks 等)
   │  ├─ nav.ts                 # 4. 顶部导航栏配置 (Header nav 菜单与下拉)
   │  ├─ sidebar.ts             # 5. 侧边栏配置 (文档目录树结构)
   │  └─ search.ts              # 6. 搜索配置 (Algolia / 本地搜索)
   ├─ theme/                    # 🎨 主题样式与组件扩展
   │  ├─ index.ts               # 主题入口文件
   │  ├─ style.css              # 自定义 CSS 样式/变量覆盖
   │  └─ components/            # 自定义 Vue 组件
   └─ config.ts                 # 🚀 VitePress 主入口文件 (即你贴出的汇总代码)
```

* 静态资源管理
  * 根目录下新建 `public` 文件
  * `.gitignore` 文件忽略 `.env.production` 文件