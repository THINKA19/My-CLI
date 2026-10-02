# Docker 使用说明

## 目录结构

* 1、目录结构

```
template/
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
└── _dockerignore               # 生成后改名为 .dockerignore
```

* 2、目录结构详解

```plain
template/
├── docker/
│   ├── frontend/
│   │   ├── Dockerfile          # [前端镜像构建] 多阶段构建配置：开发热重载（dev）、生产静态编译（build）以及 Nginx 高性能托管（prod）
│   │   └── nginx.conf          # [前端服务器配置] Nginx 运行规则：配置 gzip 压缩、History 路由回退（try_files）、静态资源缓存及 API 反向代理
│   ├── backend/
│   │   └── Dockerfile          # [后端镜像构建] 多阶段构建配置：开发环境挂载（dev）与生产环境瘦身编译/最小化运行时（prod）
│   ├── compose.yml             # [基础编排] Docker Compose 公共配置：定义服务名称、网络（networks）、数据卷（volumes）及基础环境变量
│   ├── compose.dev.yml         # [开发环境编排] 覆盖/补充配置：挂载源代码宿主机卷（Hot-reload）、开启调试端口与开发数据库
│   ├── compose.prod.yml        # [生产环境编排] 覆盖/补充配置：配置重启策略（restart: always）、资源限制（limits）、生产日志策略与健康检查
│   └── README.md               # [容器化文档] 说明 Docker 环境启动命令（如 docker compose -f ... up）、环境变量配置及多容器调试指南
└── _dockerignore                # [构建黑名单模板] 生成项目时将被 CLI 重命名为 .dockerignore，用于排除 node_modules、.git、dist 等文件以大幅缩减构建上下文体积
```

* 3、**根 `package.json` 增加脚本**（避免记长命令）

```bash
"scripts": {
  "docker:dev": "docker compose -f docker/compose.yml -f docker/compose.dev.yml up --build",
  "docker:prod": "docker compose -f docker/compose.yml -f docker/compose.prod.yml up -d --build",
  "docker:down": "docker compose -f docker/compose.yml down"
}
```

## 文件说明

| 文件                  | 作用                                                |
| --------------------- | --------------------------------------------------- |
| `frontend/Dockerfile` | 前端镜像：开发阶段 dev，生产阶段构建后用 nginx 托管 |
| `frontend/nginx.conf` | 前端 nginx 配置（路由回退、缓存、`/api` 转发）      |
| `backend/Dockerfile`  | 后端镜像：开发阶段 dev，生产阶段运行编译产物        |
| `compose.yml`         | 公共配置（单独使用等同生产镜像）                    |
| `compose.dev.yml`     | 开发覆盖：挂载源码、热更新、暴露端口                |
| `compose.prod.yml`    | 生产覆盖：重启策略、只暴露 80 端口                  |
| `../.dockerignore`    | 构建时忽略的文件，必须在仓库根目录                  |

## 使用前

1. 安装并启动 Docker
2. 本地执行 `pnpm install`，并提交 `pnpm-lock.yaml`（镜像里用 `--frozen-lockfile` 安装）
3. 需要环境变量时，复制 `.env.example` 为 `.env`

## 开发环境

```bash
pnpm docker:dev
```

- 前端：http://localhost:5173
- 后端：http://localhost:3000

修改源码会自动热更新。新增 app 或 package 后，需在 `compose.dev.yml` 的 `volumes` 里补充对应的 `node_modules` 路径。

## 生产环境

```bash
pnpm docker:prod
```

访问 http://localhost 。前端通过 `/api/` 转发到后端。

## 停止与清理

```bash
pnpm docker:down
```

## 常用命令

```bash
# 查看日志
docker compose -f docker/compose.yml logs -f

# 只重新构建某个服务
docker compose -f docker/compose.yml -f docker/compose.prod.yml build frontend
```

## 注意

- `compose.yml` 里的 `context: ..` 指向仓库根目录，因为前后端都依赖根目录的 workspace 配置和 `packages/`，不要改成 `docker/` 下的子目录
- Dockerfile 里的包名（`web`、`server`）和产物路径（`dist`）要与你的 app 一致