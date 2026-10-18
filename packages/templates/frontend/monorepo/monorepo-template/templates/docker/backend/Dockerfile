# 构建上下文是仓库根目录（见 compose.yml 的 context）

# ---------- base ----------
FROM node:24-alpine AS base
RUN corepack enable
WORKDIR /repo

# ---------- dev：开发阶段（源码由 compose.dev.yml 挂载进来） ----------
FROM base AS dev
COPY . .
RUN pnpm install --frozen-lockfile
EXPOSE 3000
# 按需修改 server 为你的包名，dev 脚本建议使用 node --watch 等热重启方式
CMD ["pnpm", "--filter", "server", "dev"]

# ---------- build：编译 ----------
FROM base AS build
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter "server..." build

# ---------- prod：生产运行 ----------
FROM build AS prod
ENV NODE_ENV=production
# 删除 devDependencies，减小体积
RUN pnpm prune --prod
USER node
EXPOSE 3000
# 入口文件按需修改
CMD ["node", "apps/server/dist/index.js"]