你可以直接复制以下内容作为项目根目录下的 **`README.md`**：

Markdown

```
# 📚 VitePress 文档与知识库项目

基于 **VitePress** 构建的高效文档工程，集成了 **Docker 多阶段构建**、**Nginx 性能优化** 以及 **GitHub Actions CI/CD 自动化部署** 工作流。

---

## 📁 核心部署结构说明

为了保持项目根目录清爽，所有与 Docker 部署相关的配置文件均已集中收拢至 `docker/` 目录下：

​```text
.
├── docker/                     # 🐳 Docker 部署专属目录 (集中收拢)
│   ├── Dockerfile              # 多阶段构建 Dockerfile (基于 Node 构建 + Nginx 托管)
│   ├── docker-compose.yml     # 本地/服务器一键编排启动脚本
│   └── nginx.conf              # 针对 VitePress SPA/路由/缓存优化的 Nginx 配置
├── .github/                    # 🤖 GitHub 自动化工作流
│   └── workflows/
│       ├── ci.yml              # 代码提交/PR 时的 代码格式检查与语法校验
│       ├── deploy.yml          # 自动化构建 Docker 镜像并部署到服务器
│       └── release.yml         # 版本发布或发布至 GitHub Pages
└── .dockerignore               # ⚠️ 必须存放在根目录！(过滤 node_modules/dist 等，加速构建)
```

> **⚠️ 注意**：`.dockerignore` 必须保留在项目根目录，否则 Docker 构建时仍然会扫描并上传 `node_modules` 等无关文件，严重影响构建性能。

## 🛠️ 本地开发指南

### 1. 环境准备

确保本地安装了 Node.js (>=18) 以及对应的包管理器（推荐使用 pnpm）：

Bash

```
# 安装项目依赖
pnpm install

# 启动本地开发服务器
pnpm run docs:dev
```

## 🐳 Docker 本地构建与验证

如果你需要在本地测试 Docker 镜像或验证 Nginx 配置，请按照以下步骤运行：

### 方式一：使用 docker-compose（推荐）

在项目根目录下直接执行：

Bash

```
# 启动服务（后台运行）
docker compose -f docker/docker-compose.yml up -d --build

# 查看运行日志
docker compose -f docker/docker-compose.yml logs -f

# 停止并移除容器
docker compose -f docker/docker-compose.yml down
```

服务启动后，在浏览器访问 `http://localhost:80` 即可查看运行中的文档。

### 方式二：使用原生 Docker 命令

由于 Dockerfile 位于 `docker/` 子目录下，构建上下文（Context）必须指定为项目根目录 `.`：

Bash

```
# 1. 在项目根目录下构建镜像
docker build -t vitepress-docs:latest -f docker/Dockerfile .

# 2. 运行容器（将容器内 80 端口映射到宿主机 8080 端口）
docker run -d -p 8080:80 --name vitepress-app vitepress-docs:latest
```

## 🤖 CI/CD 自动化工作流说明

项目配置了完整的 GitHub Actions 工作流，位于 `.github/workflows/`：

1. **`ci.yml` (代码校验)**
   - **触发条件**：向 `main` / `master` 分支提交代码或发起 Pull Request。
   - **作用**：运行 ESLint 静态代码检查与 VitePress 语法校验，确保代码质量。
2. **`deploy.yml` (服务器部署)**
   - **触发条件**：合并/推送到主分支时自动触发。
   - **作用**：自动构建 Docker 镜像，推送至 Docker Registry（如 Docker Hub / GHCR），并通过 SSH 登录远程服务器更新容器。
3. **`release.yml` (版本发布)**
   - **触发条件**：推送 Tag 或手动触发 Workflow。
   - **作用**：打包发布产物，或同步部署至 GitHub Pages。

## ⚙️ 关键部署配置示例

若要在服务器端直接使用 `docker-compose.yml`，请确保配置中的路径对应正确：

YAML

```
version: '3.8'

services:
  vitepress-docs:
    build:
      context: ..              # 上下文指向项目根目录
      dockerfile: docker/Dockerfile
    container_name: vitepress-docs
    restart: always
    ports:
      - "80:80"
<ElicitationsGroup message="接下来，你可以补充以下相关配置文件：">
  <Elicitation label="生成针对 VitePress 优化的 nginx.conf" query="请提供针对 VitePress 路由与缓存优化的 docker/nginx.conf 配置文件及注释"/>
  <Elicitation label="生成多阶段构建的 Dockerfile" query="请提供适用于 VitePress 的 docker/Dockerfile 多阶段构建代码"/>
  <Elicitation label="生成完整的 ci.yml 工作流" query="请提供 .github/workflows/ci.yml 的完整代码与配置说明"/>
</ElicitationsGroup>
```