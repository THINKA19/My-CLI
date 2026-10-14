# 部署检查清单

本项目支持选择一个或多个部署目标，各目标独立配置。平台凭据和域名通过环境变量、
GitHub Variables 与 Secrets 提供，配置项以 [部署指南](DEPLOYMENT.md) 为准。

## 项目与依赖

- [ ] 使用 Node.js 24 和 pnpm 11。
- [ ] pnpm-lock.yaml 已提交；修改依赖后运行 pnpm install 并提交更新的锁文件。
- [ ] 生成项目的 package.json、src、docker 和 .github 位于仓库根目录。
- [ ] pnpm test:menus、pnpm test:deploy、pnpm typecheck 通过。
- [ ] 设置实际 VITE_SITE_URL 和 VITE_BASE 后，pnpm build:deploy 成功。
- [ ] pnpm preview 中验证首页、示例页、语言切换、页面刷新和不存在的地址。
- [ ] 检查 dist/sitemap.xml 与页面 canonical，确认域名及部署前缀一致。
- [ ] 分享图片、仓库链接和站点名称已按项目实际情况设置。

## 平台配置

- [ ] 只开启需要的 ENABLED 变量；第一次部署已创建对应站点、存储桶或镜像仓库。
- [ ] GitHub Pages 的 Source 设置为 GitHub Actions，使用 release.yml 发布入口。
- [ ] Vercel 的 VERCEL_TOKEN、VERCEL_ORG_ID、VERCEL_PROJECT_ID 配置完整。
- [ ] Cloudflare 的 CLOUDFLARE_API_TOKEN、CLOUDFLARE_ACCOUNT_ID 配置完整，
      CLOUDFLARE_PROJECT_NAME 设置在 Variables 中。
- [ ] OSS 的区域、存储桶、站点地址、访问密钥及可选目录前缀配置完整。
- [ ] COS 使用 COS_SECRET_ID、COS_SECRET_KEY，区域和存储桶与账号一致。
- [ ] OSS/COS 的静态托管、HTTPS 和 cleanUrls 的 CDN/网关规则已经配置。
- [ ] Vercel/Cloudflare 使用本文工作流时，没有同时启用另一条 Git 自动部署流程。

## Docker 与服务器

- [ ] Docker 引擎运行，使用 docker/Dockerfile 成功构建镜像。
- [ ] 容器 /healthz 返回 200，根路径或配置的子路径页面与资源可访问。
- [ ] 镜像 IMAGE 包含 registry 和 namespace，不带 tag；登录凭据使用镜像仓库凭据。
- [ ] 阿里云、腾讯云或 Docker Hub 的 BASE 与 SITE_URL 子路径一致。
- [ ] SERVER_IMAGE 与已启用的镜像目标一致，完整提交 SHA 标签已推送。
- [ ] SERVER_HOST、SERVER_USER、SERVER_SSH_KEY、SERVER_FINGERPRINT 及仓库凭据配置完整。
- [ ] 服务器 Docker、端口及外部 HTTPS 配置可用。
- [ ] 已明确发布存在短暂中断，保留 previous 容器用于失败回退。

## 发布行为

OSS/COS 先上传资源，再发布 HTML；资源失败立即停止，但 HTML 阶段并非原子发布。
脚本不删除远端旧文件，删除页面或清理历史产物需按平台维护策略处理。
云平台上的实际发布、存储桶权限和域名配置不属于本地测试的验证范围。

相关说明：[部署脚本](../../scripts/deploy/README.md)、[Docker](../../docker/README.md)、
[配置架构](../../.vitepress/config/README.md)。
