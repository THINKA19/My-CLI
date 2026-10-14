# Docker 部署

Docker 镜像采用两阶段构建：Node.js 24 使用 pnpm 安装依赖并生成站点，Nginx 托管静态产物。
构建域名和部署目录通过参数传入，切换服务器或镜像仓库无需修改业务代码。

## 本地构建与运行

在生成项目根目录执行，确保 Docker 引擎已启动：

```powershell
$env:VITE_SITE_URL = 'https://docs.example.com'
$env:VITE_BASE = '/'
docker compose -f docker/docker-compose.yml up -d --build
```

访问 http://localhost:8080，健康检查为 http://localhost:8080/healthz。
容器默认使用 8080:80 映射，自动重启并限制日志大小。

单独构建：

```powershell
docker build -f docker/Dockerfile --build-arg VITE_BASE=/ --build-arg VITE_SITE_URL=https://docs.example.com -t vitepress-docs .
docker run -d --name vitepress-docs -p 8080:80 vitepress-docs
```

## 子路径

部署到 /docs/ 时设置 VITE_BASE=/docs/，VITE_SITE_URL=https://docs.example.com/docs/。
构建产物保存到 Nginx 的 html/docs/ 目录，页面、资源和 sitemap 使用同一部署前缀。
根路径不提供文档首页，应访问 /docs/；/healthz 不受部署前缀影响。
部署目录不能包含目录跳转、查询参数或跨域地址。

## 文件与依赖

- docker/Dockerfile：安装依赖、生成菜单和站点、按部署目录整理运行文件。
- docker/nginx.conf：cleanUrls 路由、自定义 404、缓存、压缩和统一响应头。
- docker/docker-compose.yml：本地服务编排与构建参数。
- docker/Dockerfile.dockerignore：过滤构建上下文，保留文档源码与 Nginx 配置。
- 项目提供 pnpm-lock.yaml；修改依赖后运行 pnpm install 并提交更新的锁文件。

VitePress 指纹资源采用长期缓存，HTML 和站点元数据采用重新校验策略。
各 location 继承同一组安全及缓存响应头，避免局部声明导致父级响应头丢失。
HTTPS 可由服务器前方的反向代理或负载均衡提供。

## 云端部署

GitHub Actions 可以独立推送到阿里云 ACR、腾讯云镜像仓库或 Docker Hub，
再由通用服务器工作流拉取提交 SHA 对应的镜像。镜像推送与服务器运行是两个步骤。
启用开关、域名和凭据见 [多平台部署指南](../docs/ai/DEPLOYMENT.md)。
# Docker 构建中的 Git 历史

构建上下文不包含 `.git`，Alpine 构建阶段也不安装 Git。
Dockerfile 设置 `VITE_LAST_UPDATED=false`，关闭需要 Git 历史的更新时间显示；
普通构建保持默认开启。Docker 测试仍需完成镜像构建与 HTTP 检查才算通过。
