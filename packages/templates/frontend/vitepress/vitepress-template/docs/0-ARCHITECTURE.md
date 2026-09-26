# 脚手架内部架构设计说明

## v0.0.1 (2026-09-24) 

### 新增

* 搭建脚手架基础目录结构，初始化项目模板基础文件夹

```plain
├── bin/              # CLI 执行入口目录（包含可执行脚本）
├── template/         # 预置的项目模板资源（用于脚手架初始化时复制）
├── docs/             # 脚手架自身的开发与架构文档目录
│   ├── ARCHITECTURE.md # 内部架构设计与核心逻辑说明
│   └── CONTRIBUTING.md # 开发者贡献指南与代码规范
├── CHANGELOG.md      # 全局版本更新与变更日志
├── package.json      # 包元数据与 CLI 运行指令配置
└── README.md         # 脚手架使用说明与快速开始文档
```

## v0.0.2 (2026-09-24) 

### 新增

* vitepress 脚手架创建项目

```plain
├─ docs
│  ├─ .vitepress
│  │  └─ config.js
│  ├─ api-examples.md
│  ├─ markdown-examples.md
│  └─ index.md
└─ package.json
```

### 修改

* md 文件全部放到了 src 文件夹下
* 新增了 .gitignore 文件

```plain
src/
├─ api-examples.md
├─ markdown-examples.md
└─ index.md

.gitignore
```

* 初始化VitePress自定义theme主题目录

```plain
.vitepress/
  └─ theme/
     ├─ index.ts
     └─ styles/
```

## v0.1.0 (2026-09-25) 

### 新增

前端编码规范，新增的文件

* .husky 文件
* commitlint.config.js 文件
* eslint.config.js 文件

### 修改

修改内容

* package.json 文件

## v0.1.1(2026-09-25) 

### 新增

工程化配置，构建基础设施

* .vscode 文件
* .editorconfig 文件
* .env 环境变量
* .gitattributes
* .npmignore、.npmrc、.nvmrc 文件
* LICENSE 文件
* pnpm-workspace.yaml 文件
* tsconfig.json 文件

### 修改

修改内容

* package.json 文件

## v0.2.0(2026-09-25) 

### 新增

* 目录结构
  * docker
  * .github
  * .dockerignore 

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

### 修改

`package.json` 配置

```js
 "scripts": {
    "docker:build": "docker build -f docker/Dockerfile -t my-vitepress-docs:latest .",
    "docker:up": "docker compose -f docker/docker-compose.yml up -d --build",
    "docker:down": "docker compose -f docker/docker-compose.yml down",
    "docker:logs": "docker compose -f docker/docker-compose.yml logs -f"
  }
```

## v0.3.0(2026-09-26) 

### 新增

config 配置，完成基础版

* 根目录 public 文件
* .vitepress 文件夹下 config 文件 

### 修改

修改内容

* src 文件夹下，api-examples.md 和 markdown-examples.md

