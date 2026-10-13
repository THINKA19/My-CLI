# 🚀 部署前检查清单 (Pre-Deployment Checklist)

本文档列出了项目上线前必须完成的所有配置和检查项。

---

## ⚠️ 必须完成的配置（阻碍上线）

### 1. 环境变量配置

#### `.env.production` 文件

**必须修改以下配置：**

```env
# ⚠️ 重要：修改为你的生产环境 CDN 或静态资源地址
VITE_ASSETS_BASE_URL=https://your-cdn.com/assets/

# ⚠️ 重要：修改为你的生产环境域名
VITE_SITE_URL=https://your-domain.com
```

**如何修改：**

1. 打开 `.env.production` 文件
2. 将 `https://your-domain.com` 替换为你的实际域名
3. 将 `https://your-cdn.com/assets/` 替换为你的 CDN 地址（如果没有 CDN，可以使用相对路径 `/assets/`）

**验证方法：**

```bash
# Windows PowerShell
$env:VITE_SITE_URL='https://your-actual-domain.com'
pnpm run build

# Linux/Mac
VITE_SITE_URL=https://your-actual-domain.com pnpm run build
```

---

### 2. GitHub Secrets 配置

如果使用 GitHub Actions 自动部署，需要配置以下 Secrets：

#### **多平台部署所需 Secrets**

前往 GitHub 仓库 Settings → Secrets and variables → Actions，添加以下密钥：

##### Vercel 部署（可选）
- `VERCEL_TOKEN` - Vercel 访问令牌
- `VERCEL_ORG_ID` - Vercel 组织 ID
- `VERCEL_PROJECT_ID` - Vercel 项目 ID

##### Cloudflare Pages 部署（可选）
- `CLOUDFLARE_API_TOKEN` - Cloudflare API 令牌
- `CLOUDFLARE_ACCOUNT_ID` - Cloudflare 账户 ID
- `CLOUDFLARE_PROJECT_NAME` - Cloudflare Pages 项目名称

##### Docker 镜像推送（可选）

**腾讯云容器镜像服务：**
- `TENCENT_CLOUD_SECRET_ID` - 腾讯云 SecretId
- `TENCENT_CLOUD_SECRET_KEY` - 腾讯云 SecretKey
- `TENCENT_CCR_REGISTRY` - 腾讯云镜像仓库地址（可选，默认 ccr.ccs.tencentyun.com）
- `TENCENT_CCR_NAMESPACE` - 腾讯云命名空间（可选，默认 vitepress）

**阿里云容器镜像服务：**
- `ALIYUN_REGISTRY_USERNAME` - 阿里云镜像仓库用户名
- `ALIYUN_REGISTRY_PASSWORD` - 阿里云镜像仓库密码
- `ALIYUN_ACR_REGISTRY` - 阿里云镜像仓库地址（可选，默认 registry.cn-hangzhou.aliyuncs.com）
- `ALIYUN_ACR_NAMESPACE` - 阿里云命名空间（可选，默认 vitepress）

**Docker Hub（可选）：**
- `DOCKERHUB_USERNAME` - Docker Hub 用户名
- `DOCKERHUB_TOKEN` - Docker Hub 访问令牌

---

### 3. README 文件更新

**必须替换的占位符：**

在 `README.md` 中搜索并替换以下内容：

- `your-username` → 你的 GitHub 用户名
- `your-repo` → 你的仓库名称
- `your-domain.com` → 你的实际域名
- `Your Team` → 你的团队名称

---

## ✅ 构建验证

### 本地构建测试

```bash
# 1. 设置生产环境变量
# Windows PowerShell
$env:VITE_SITE_URL='https://your-domain.com'
$env:VITE_ASSETS_BASE_URL='https://your-cdn.com/assets/'

# Linux/Mac
export VITE_SITE_URL=https://your-domain.com
export VITE_ASSETS_BASE_URL=https://your-cdn.com/assets/

# 2. 运行类型检查
pnpm run typecheck

# 3. 运行代码检查
pnpm run lint

# 4. 构建生产版本
pnpm run build

# 5. 预览构建产物
pnpm run preview
```

**期望结果：**

```
✓ building client + server bundles...
✓ rendering pages...
✓ generating sitemap...
build complete in 10.74s.
```

---

## 🐳 Docker 部署验证

### 本地 Docker 测试

```bash
# 1. 构建镜像
docker build -t vitepress-docs .

# 2. 运行容器
docker run -d -p 8080:80 --name vitepress-test vitepress-docs

# 3. 访问测试
curl http://localhost:8080

# 4. 健康检查
docker ps
# 查看 STATUS 列应显示 "healthy"

# 5. 停止并删除测试容器
docker stop vitepress-test
docker rm vitepress-test
```

---

## 📋 部署检查清单

部署前逐项确认：

### 环境配置
- [ ] `.env.production` 已配置生产环境域名
- [ ] `.env.production` 已配置 CDN 或静态资源地址
- [ ] GitHub Secrets 已配置（如使用自动部署）

### 代码质量
- [ ] TypeScript 类型检查通过 (`pnpm run typecheck`)
- [ ] ESLint 代码检查通过 (`pnpm run lint`)
- [ ] 本地构建成功 (`pnpm run build`)
- [ ] 本地预览正常 (`pnpm run preview`)

### 文档完整性
- [ ] README.md 占位符已替换
- [ ] LICENSE 文件已配置
- [ ] 所有文档链接有效

### Git 仓库
- [ ] `.gitignore` 正确配置
- [ ] 没有敏感信息提交到仓库
- [ ] dist/ 目录未被提交
- [ ] node_modules/ 未被提交
- [ ] .env.local 文件未被提交

### CI/CD
- [ ] GitHub Actions 工作流语法正确
- [ ] 所有必需的 Secrets 已配置
- [ ] Node.js 版本一致（推荐 20.x）
- [ ] pnpm 版本一致（推荐 11.x）

### Docker（如使用）
- [ ] Dockerfile 构建成功
- [ ] 本地 Docker 测试通过
- [ ] 健康检查正常工作
- [ ] 镜像仓库已配置（腾讯云/阿里云）

---

## 🔍 常见问题排查

### 问题1：构建失败 - "缺少必需的环境变量: VITE_SITE_URL"

**原因：** 生产环境构建时未设置 `VITE_SITE_URL`

**解决方案：**

```bash
# 方法1：在命令行设置
# Windows
$env:VITE_SITE_URL='https://your-domain.com'; pnpm run build

# Linux/Mac
VITE_SITE_URL=https://your-domain.com pnpm run build

# 方法2：修改 .env.production 文件
# 将 VITE_SITE_URL 改为你的实际域名
```

### 问题2：GitHub Actions 构建失败

**检查项：**

1. 确认 `.github/workflows/` 中的工作流文件语法正确
2. 确认必需的 Secrets 已配置
3. 查看 Actions 日志中的具体错误信息
4. 确认 Node.js 和 pnpm 版本一致

### 问题3：Docker 镜像构建失败

**检查项：**

1. 确认 Dockerfile 位于项目根目录
2. 确认 docker/nginx.conf 文件存在
3. 检查 .dockerignore 是否正确配置
4. 查看 Docker 构建日志中的具体错误

### 问题4：部署后静态资源404

**原因：** `VITE_ASSETS_BASE_URL` 配置错误或 CDN 未正确配置

**解决方案：**

1. 检查 `.env.production` 中的 `VITE_ASSETS_BASE_URL`
2. 确认 CDN 或静态资源服务器可访问
3. 如果没有 CDN，使用相对路径 `/assets/`

---

## 📚 相关文档

- [项目说明文档](./README.md)
- [AI 协作开发指南](./AGENTS.md)
- [配置优化说明](./.vitepress/config/OPTIMIZATION.md)
- [变更日志](./.vitepress/config/CHANGES.md)

---

## 🆘 获取帮助

如果遇到问题：

1. 查看本文档的常见问题排查部分
2. 查看 [GitHub Issues](https://github.com/your-username/your-repo/issues)
3. 提交新的 Issue 并提供详细的错误信息

---

**最后更新：** 2024-10-03  
**文档版本：** 1.0.0
