# 部署脚本

本目录集中管理部署脚本。以下命令均在项目根目录执行，无需进入本目录安装依赖。

## 依赖与安装

部署新增的依赖统一声明在根目录 `package.json` 的 `devDependencies` 中：

| 依赖 | 版本 | 用途 |
| --- | --- | --- |
| `ali-oss` | `6.23.0` | 阿里云 OSS SDK，上传静态文件并设置响应头 |
| `cos-nodejs-sdk-v5` | `3.0.0` | 腾讯云 COS SDK，上传静态文件并设置响应头 |

构建还使用项目的 `vitepress`、`vite` 和 `vue`。
Node.js 内置的 `fs`、`path`、`url` 模块无需安装。

推荐 Node.js 24 和 pnpm 11。统一安装：

```powershell
pnpm install
```

不要使用 `pnpm install --prod` 进行构建或上传，部署工具位于开发依赖中。
脚手架提供 `pnpm-lock.yaml`，GitHub Actions 与 Docker 使用它执行冻结安装。
修改依赖后运行 `pnpm install` 并提交更新的锁文件；脚本目录没有独立的 package.json。

Windows 若安装时报符号链接权限错误，可在当前 PowerShell 会话中使用 hoisted 布局：

```powershell
$env:pnpm_config_node_linker = 'hoisted'
pnpm install
```

后续快捷命令在同一会话运行即可，无需修改项目配置。

## 脚本与快捷命令

| 脚本 | 用途 | 用法 |
| --- | --- | --- |
| `build.js` | 校验部署参数并构建到 `dist/`；SEO 和 sitemap 由站点配置统一处理 | `pnpm build:deploy` |
| `check-config.js` | 发布前检查目标配置，只显示变量名 | `pnpm deploy:check vercel` |
| `verify-output.js` | 检查构建页面、资源及 sitemap，使用构建时相同的 VITE_ 环境变量 | `node scripts/deploy/verify-output.js` |
| `oss.js` | 将已有 `dist/` 上传到 OSS | `node scripts/deploy/oss.js` |
| `cos.js` | 将已有 `dist/` 上传到 COS | `node scripts/deploy/cos.js` |
| `prepare-vercel.js` | 将已有 `dist/` 转成 Vercel 预构建产物 | `node scripts/deploy/prepare-vercel.js` |
| `upload-utils.js` | 文件扫描、环境变量检查、Content-Type 和缓存策略 | 被 OSS/COS 脚本导入，无需单独运行 |

`pnpm deploy:oss`、`pnpm deploy:cos` 会先构建再上传；
`pnpm deploy:vercel:prepare` 会先构建再准备产物，不会发布网站。

## 构建

在 PowerShell 中设置实际域名后构建：

```powershell
$env:VITE_SITE_URL = 'https://docs.example.com'
$env:VITE_BASE = '/'
pnpm build:deploy
pnpm preview
```

构建读取根目录的生产环境文件和当前进程中的 `VITE_` 变量，进程变量优先。
`build:deploy` 先生成菜单，再执行部署构建；直接运行 build.js 前需先生成菜单。
子路径部署时，站点地址与基准路径保持一致：

```powershell
$env:VITE_SITE_URL = 'https://docs.example.com/docs'
$env:VITE_BASE = '/docs/'
pnpm build:deploy
```

## 阿里云 OSS

在当前 PowerShell 会话中填写实际配置，再运行构建与上传：

```powershell
$env:VITE_SITE_URL = 'https://docs.example.com'
$env:VITE_BASE = '/'
$env:OSS_REGION = 'oss-cn-hangzhou'
$env:OSS_BUCKET = 'your-bucket'
$env:OSS_ACCESS_KEY_ID = '<访问密钥 ID>'
$env:OSS_ACCESS_KEY_SECRET = '<访问密钥 Secret>'
pnpm deploy:oss
```

可选变量：`OSS_PREFIX` 为上传目录前缀，`OSS_ENDPOINT` 为实际服务端点。
例如上传到 `docs/` 时，设置 `OSS_PREFIX=docs`、`VITE_BASE=/docs/`，
站点地址也包含 `/docs`。国内及国际地域使用对应控制台提供的 Region 和 Endpoint。

已构建且只需上传时运行：

```powershell
node scripts/deploy/oss.js
```

## 腾讯云 COS

```powershell
$env:VITE_SITE_URL = 'https://docs.example.com'
$env:VITE_BASE = '/'
$env:COS_REGION = 'ap-guangzhou'
$env:COS_BUCKET = 'your-bucket-1250000000'
$env:COS_SECRET_ID = '<SecretId>'
$env:COS_SECRET_KEY = '<SecretKey>'
pnpm deploy:cos
```

可选变量 `COS_PREFIX` 用于上传子目录，需与 `VITE_BASE` 和站点地址一致。
地域使用存储桶实际的 Region。已构建且只需上传时运行：

```powershell
node scripts/deploy/cos.js
```

OSS/COS 脚本全量上传，资源成功后再上传 HTML；任何上传失败立即停止，不删除远端旧文件。
HTML 发布不是原子切换，部分 HTML 上传后失败时需重新执行发布。
SDK 凭据从进程环境变量读取，不会自动从 `.env.production` 读取。
不要将密钥写入 `VITE_` 变量或提交到仓库。
存储桶访问权限、静态网站托管、HTTPS 和无扩展名路由需另行配置。

## Vercel

```powershell
$env:VITE_SITE_URL = 'https://docs.example.com'
$env:VITE_BASE = '/'
pnpm deploy:vercel:prepare
```

产物位于 `.vercel/output/`，每次准备会重建 static 目录，清除已删除页面。
该目录属于生成产物，不应手动存放文件。实际发布需要设置对应项目凭据：

```powershell
$env:VERCEL_ORG_ID = '<组织或团队 ID>'
$env:VERCEL_PROJECT_ID = '<项目 ID>'
$env:VERCEL_TOKEN = '<访问令牌>'
pnpm dlx vercel deploy --prebuilt --prod --yes --token "$env:VERCEL_TOKEN"
```

`vercel` CLI 由 `pnpm dlx` 临时获取，没有新增为项目依赖。
这条发布命令会更新正式站点。预构建方式使用生成的路由配置，不使用根目录
`vercel.json` 的构建和重写设置。

## GitHub Pages、Cloudflare 和 Docker

GitHub Pages 的上传和发布由 Workflow 执行，没有独立的本地上传脚本。
Cloudflare Workflow 构建后使用 `pnpm dlx wrangler` 上传，`wrangler` 也不是新增的项目依赖。
Docker 使用 `docker/Dockerfile` 和 `pnpm build:deploy` 构建，无需 OSS/COS 上传命令。
Docker 支持 `/` 和 `/docs/` 等部署目录，文件位置与 VITE_BASE 一致，健康检查地址为 `/healthz`。

部署脚本的本地回归检查使用 `pnpm test:deploy`，测试只操作临时目录和模拟上传，不连接云平台。

全平台 Actions 测试与真实发布验收见 [部署测试指南](../../docs/ai/DEPLOYMENT_TESTING.md)。

各平台的启用开关、账号凭据和服务器部署步骤见
[部署指南](../../docs/ai/DEPLOYMENT.md)，上线前参考
[部署检查清单](../../docs/ai/DEPLOYMENT_CHECKLIST.md)。
