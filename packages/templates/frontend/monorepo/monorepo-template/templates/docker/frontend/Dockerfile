# 构建上下文是仓库根目录（见 compose.yml 的 context）

# ---------- base：公共环境 ----------
FROM node:24-alpine AS base
# 启用 corepack，自动使用 package.json 里 packageManager 指定的 pnpm 版本
RUN corepack enable
WORKDIR /repo

# ---------- dev：开发阶段（源码由 compose.dev.yml 挂载进来） ----------
FROM base AS dev
COPY . .
RUN pnpm install --frozen-lockfile
EXPOSE 5173
# --host 0.0.0.0 才能让容器外的浏览器访问（按需修改 web 为你的包名）
CMD ["pnpm", "--filter", "web", "dev", "--host", "0.0.0.0"]

# ---------- build：构建静态文件 ----------
FROM base AS build
COPY . .
RUN pnpm install --frozen-lockfile
# "web..." 表示构建 web 以及它依赖的 workspace 包（按依赖顺序）
RUN pnpm --filter "web..." build

# ---------- prod：用 nginx 托管静态文件 ----------
FROM nginx:alpine AS prod
COPY docker/frontend/nginx.conf /etc/nginx/conf.d/default.conf
# 构建产物目录按需修改
COPY --from=build /repo/apps/web/dist /usr/share/nginx/html
EXPOSE 80