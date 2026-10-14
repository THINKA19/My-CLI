# 多平台部署配置

以下 Workflow 用于脚手架生成后的独立项目：项目根目录包含 package.json、src、docker 和 .github。
它们不会在当前 My-CLI 仓库的嵌套模板目录自动运行。若直接在模板目录测试 Docker，
使用 Dockerfile 专用的 docker/Dockerfile.dockerignore 过滤构建上下文。

所有自动部署默认关闭。在 GitHub Settings → Secrets and variables → Actions 中设置下表变量。
ENABLED 变量必须是字符串 true。Pages、OSS、COS、Vercel、Cloudflare 也支持在 Actions 中手动运行。
各平台独立构建，路径和域名不会共用。不要同时开启 Vercel/Cloudflare 的 Git 自动部署与本项目 Workflow。

| 平台 | Variables | Secrets |
| --- | --- | --- |
| GitHub Pages | PAGES_ENABLED=true | 无，仓库 Pages Source 选 GitHub Actions |
| 阿里云 OSS | OSS_ENABLED=true、OSS_REGION、OSS_BUCKET、OSS_SITE_URL；可选 OSS_PREFIX、OSS_ENDPOINT | OSS_ACCESS_KEY_ID、OSS_ACCESS_KEY_SECRET |
| 腾讯云 COS | COS_ENABLED=true、COS_REGION、COS_BUCKET、COS_SITE_URL；可选 COS_PREFIX | COS_SECRET_ID、COS_SECRET_KEY |
| Vercel | VERCEL_ENABLED=true、VERCEL_SITE_URL | VERCEL_TOKEN、VERCEL_ORG_ID、VERCEL_PROJECT_ID |
| Cloudflare Pages | CLOUDFLARE_ENABLED=true、CLOUDFLARE_SITE_URL、CLOUDFLARE_PROJECT_NAME | CLOUDFLARE_API_TOKEN、CLOUDFLARE_ACCOUNT_ID |
| 阿里云镜像 | ALIYUN_DOCKER_ENABLED=true、ALIYUN_ACR_REGISTRY、ALIYUN_DOCKER_IMAGE、ALIYUN_SITE_URL | ALIYUN_REGISTRY_USERNAME、ALIYUN_REGISTRY_PASSWORD |
| 腾讯云镜像 | TENCENT_DOCKER_ENABLED=true、TENCENT_CCR_REGISTRY、TENCENT_DOCKER_IMAGE、TENCENT_SITE_URL | TENCENT_REGISTRY_USERNAME、TENCENT_REGISTRY_PASSWORD |
| Docker Hub | DOCKERHUB_ENABLED=true、DOCKERHUB_IMAGE、DOCKERHUB_SITE_URL | DOCKERHUB_USERNAME、DOCKERHUB_TOKEN |

SITE_URL 填实际公开站点完整地址；上传子目录时包含该目录，例如 https://docs.example.com/docs。
镜像 IMAGE 填不带 tag 的完整地址，例如 docker.io/account/vitepress-docs，
或 registry.example.com/namespace/vitepress-docs。REGISTRY 只填域名，不包含 https:// 和路径。
阿里云及腾讯云国内、国际地域都使用各自控制台给出的仓库地址和 Docker 登录凭据，
不要将腾讯云 API SecretId/SecretKey 当作镜像仓库用户名和密码。

## 通用 Linux 服务器部署

需要服务器已安装 Docker，配置：

- Variables：SERVER_DEPLOY_ENABLED=true、SERVER_IMAGE、SERVER_REGISTRY；可选 SERVER_PORT（默认 8080）。
- Secrets：SERVER_HOST、SERVER_USER、SERVER_SSH_KEY、SERVER_FINGERPRINT、
  SERVER_REGISTRY_USERNAME、SERVER_REGISTRY_PASSWORD。
- SERVER_IMAGE 必须与某个已启用镜像目标的 IMAGE 完全一致，不带 tag。
- 推送 main 后镜像 Workflow 成功会调用服务器部署；手动运行 deploy.yml 前，
  所选提交必须已有相应完整 SHA 标签的镜像。
- 部署先拉取并检查新镜像健康，再更换旧容器；保留 previous 容器以便回退。
  此流程会有短暂中断，未提供负载均衡或 HTTPS。

## 本地运行

PowerShell 示例：

```powershell
$env:VITE_SITE_URL = 'https://docs.example.com'
$env:VITE_BASE = '/'
pnpm build
docker compose -f docker/docker-compose.yml up -d --build
```

部署 SDK 已纳入根目录 devDependencies，统一运行 `pnpm install`。
上传可运行 `pnpm deploy:oss` 或 `pnpm deploy:cos`（均先构建再上传）。
依赖、环境变量和各脚本的用法见 [部署脚本说明](../../scripts/deploy/README.md)。
脚本全量上传，HTML 最后上传，不删除远端文件、不修改存储桶权限。
不要在浏览器端或 VITE_ 变量中放置访问密钥。

## 静态网站托管前提

OSS/COS 上传脚本不创建存储桶、CDN 或域名。须在控制台启用静态网站托管、
设置首页 index.html 和错误页 404.html，配置所需公开访问策略及 HTTPS。
由于现有站点使用 cleanUrls，必须配置 CDN/网关把 /guide 映射到 /guide.html，
并把 /目录/ 映射到 /目录/index.html；对象存储仅设置默认首页不足以覆盖所有文档路由。
COS_REGION 与 OSS_REGION 按实际地域设置，OSS_ENDPOINT 可用于指定对应服务端点。

Vercel Workflow 使用 Build Output API 上传预构建产物，不使用根目录 vercel.json 的构建及重写设置。
直接使用 Vercel Git 集成部署时，需另行检查该文件的 Node 版本设置和路由规则。

上线前参考 [部署检查清单](DEPLOYMENT_CHECKLIST.md)，项目维护见 [维护指南](MAINTENANCE.md)。
