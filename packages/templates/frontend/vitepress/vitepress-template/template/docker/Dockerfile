# ==================== 第一阶段：构建静态文件 ====================
FROM node:24-alpine AS builder

# 1. 挂载 pnpm 全局缓存目录（构建时性能提速 30%+）
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# 2. 启用 pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# 3. 仅复制依赖文件以极大地利用 Docker 层缓存 (Layer Cache)
COPY package.json pnpm-lock.yaml .npmrc ./

# 4. 挂载 pnpm store 缓存目录进行依赖安装
#    即使镜像变更，本地构建缓存也不会丢失，能显著加快 CI/CD 打包速度
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# 5. 复制全部项目源码
COPY . .

# 6. 执行编译打包
RUN pnpm run build

# ==================== 第二阶段：Nginx 轻量运行镜像 ====================
FROM nginx:alpine AS runner

# 1. 安装健康检查工具 curl (alpine 默认不含)
RUN apk add --no-cache curl

# 2. 安全优化：移除默认的 Nginx 欢迎页与配置,防止信息泄露
RUN rm -rf /usr/share/nginx/html/* /etc/nginx/conf.d/default.conf

# 3. 复制自定义针对 VitePress 优化的 Nginx 配置
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# 4. 从构建阶段复制打包产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 5. 安全增强：配置静态文件的读取权限为 755
RUN chmod -R 755 /usr/share/nginx/html

# 6. 声明暴露 80 端口
EXPOSE 80

# 7. 添加健康检查端点
HEALTHCHECK --interval=30s --timeout=5s --retries=3 --start-period=5s \
  CMD curl -f http://localhost/ || exit 1

# 8. 前台启动 Nginx
CMD ["nginx", "-g", "daemon off;"]