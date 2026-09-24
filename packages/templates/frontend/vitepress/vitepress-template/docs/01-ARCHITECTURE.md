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

```
src/
├─ api-examples.md
├─ markdown-examples.md
└─ index.md

.gitignore
```



