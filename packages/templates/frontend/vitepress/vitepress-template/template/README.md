# VitePress 多语言文档站点

<div align="center">

![VitePress](https://img.shields.io/badge/VitePress-2.0.0--alpha.20-646CFF?style=flat&logo=vite)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-3178C6?style=flat&logo=typescript)
![pnpm](https://img.shields.io/badge/pnpm-11.22.0-F69220?style=flat&logo=pnpm)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat&logo=node.js)
![License](https://img.shields.io/badge/License-MIT-green?style=flat)

基于 VitePress 构建的现代化多语言文档站点，支持中文、英文、越南语三种语言

[在线预览](https://your-domain.com) | [English](./README.en.md) | [Tiếng Việt](./README.vi.md)

</div>

---

## ✨ 特性

- 🌍 **多语言支持** - 内置中文、英文、越南语三种语言，架构支持轻松扩展
- 🎨 **模块化配置** - 结构与翻译完全分离，易于维护和扩展
- 🔒 **类型安全** - 完整的 TypeScript 类型定义，开发时获得最佳提示
- ✅ **配置验证** - 开发环境自动验证配置完整性，及时发现问题
- 📊 **Mermaid 图表** - 内置 Mermaid 支持，轻松绘制流程图、时序图等
- 🚀 **多平台部署** - 支持 GitHub Pages、Vercel、Cloudflare Pages、Docker
- 🔧 **开发工具链** - ESLint、TypeScript、Husky、Commitlint 等完整工具链
- 🐳 **容器化支持** - Docker 镜像构建，支持腾讯云/阿里云镜像仓库

---

## 📚 目录

- [快速开始](#-快速开始)
- [项目结构](#-项目结构)
- [开发指南](#-开发指南)
- [配置说明](#-配置说明)
- [部署指南](#-部署指南)
- [测试](#-测试)
- [贡献指南](#-贡献指南)
- [许可证](#-许可证)

---

## 🚀 快速开始

### 环境要求

- **Node.js**: >= 18.0.0
- **pnpm**: >= 11.22.0

> ⚠️ 本项目强制使用 pnpm 作为包管理器，npm/yarn 将被拒绝

### 安装依赖

```bash
# 克隆仓库
git clone https://github.com/your-username/your-repo.git
cd your-repo

# 安装依赖（必须使用 pnpm）
pnpm install
```

### 本地开发

```bash
# 启动开发服务器（热更新 + 配置验证）
pnpm run dev

# 访问 http://localhost:5173
```

启动后会自动验证配置完整性：
```
🔍 验证环境变量配置...
✅ VITE_BASE = "/"
✅ VITE_SITE_URL = "http://localhost:5173"

🔍 开始验证 [zh] 语言配置...
✅ [zh] 导航翻译验证通过 (5 个键)
✅ [zh] 侧边栏翻译验证通过 (4 个键)
✅ [zh] 搜索翻译验证通过
✅ [zh] UI 翻译验证通过
✅ [zh] 元数据验证通过
```

### 构建生产版本

```bash
# 构建生产版本
pnpm run build

# 预览构建产物
pnpm run preview
```

构建产物输出到 `dist/` 目录。

---

## 📁 项目结构

```
01-docs/
├── .github/workflows/     # GitHub Actions 工作流
│   ├── ci.yml            # 代码质量检查
│   ├── deploy.yml        # 多平台部署
│   └── docker-cloud.yml  # Docker 镜像构建
├── .vitepress/           # VitePress 配置
│   ├── config/           # 模块化配置
│   │   ├── locales/     # 国际化翻译
│   │   ├── shared/      # 共享配置结构
│   │   └── utils/       # 工具函数
│   ├── theme/           # 主题定制
│   └── config.ts        # 主配置入口
├── public/               # 静态资源
├── src/                  # Markdown 文档
│   ├── index.md         # 中文首页
│   ├── en/              # 英文文档
│   └── vi/              # 越南语文档
├── tests/                # 单元测试
├── .dockerignore
├── .env.development      # 开发环境变量
├── .env.production       # 生产环境变量
├── Dockerfile            # Docker 镜像构建
├── vercel.json           # Vercel 部署配置
├── package.json
├── AGENTS.md             # AI 协作指南
└── README.md             # 项目说明（本文档）
```

详细目录说明请查看 [AGENTS.md](./AGENTS.md)。

---

## 🛠️ 开发指南

### 可用命令

```bash
# 开发
pnpm run dev              # 启动开发服务器

# 构建
pnpm run build            # 构建生产版本
pnpm run preview          # 预览构建产物

# 代码质量
pnpm run typecheck        # TypeScript 类型检查
pnpm run lint             # ESLint 代码检查
pnpm run lint:fix         # 自动修复代码问题

# 测试
pnpm run test             # 运行单元测试
pnpm run test:coverage    # 测试覆盖率报告
pnpm run test:watch       # 测试观察模式
```

### 添加新页面

1. 在 `src/` 目录创建 Markdown 文件：

```markdown
---
title: 页面标题
description: 页面描述
---

# 页面内容

这是页面内容...
```

2. 更新导航/侧边栏配置：

```typescript
// .vitepress/config/shared/nav.config.ts
export const navStructure: NavStructureItem[] = [
  // ...现有配置
  {
    id: 'new-page',
    link: '/new-page'
  }
]
```

3. 添加各语言翻译（如需要）：

```typescript
// .vitepress/config/locales/zh/nav.ts
export const zhNavText: Record<string, string> = {
  // ...现有翻译
  'new-page': '新页面'
}
```

### 代码提交规范

遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```bash
# 格式
<type>(<scope>): <subject>

# 示例
feat(docs): 添加快速开始指南
fix(config): 修复导航链接错误
docs(readme): 更新部署说明
```

**类型说明：**
- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档变更
- `style`: 代码格式
- `refactor`: 重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建/工具变更
- `ci`: CI/CD 变更

---

## ⚙️ 配置说明

### 环境变量

创建 `.env.production` 文件配置生产环境：

```env
# 站点部署的基准路径
# 部署在根域名时设为 /
# 部署在子路径时设为 /docs/
VITE_BASE=/

# 站点完整域名（用于 SEO、sitemap 生成）
VITE_SITE_URL=https://your-domain.com
```

### 配置架构

项目采用**结构与翻译分离**的配置架构：

- **结构配置**（`shared/`）: 定义导航、侧边栏的路由和层级
- **翻译配置**（`locales/`）: 提供各语言的文本翻译
- **合并工具**（`utils/`）: 自动合并结构和翻译

**优势：**
- ✅ 修改结构只需改一处
- ✅ 新增语言只需添加翻译文件
- ✅ 结构和文本完全解耦

详细说明请查看：
- [配置优化说明](./.vitepress/config/OPTIMIZATION.md)
- [国际化架构说明](./.vitepress/config/locales/README.md)

---

## 🚢 部署指南

### 部署到 GitHub Pages

推送到 `main` 分支会自动触发部署：

```bash
git add .
git commit -m "docs: 更新文档"
git push origin main
```

访问地址：`https://username.github.io/repo-name/`

### 部署到 Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/your-repo)

**手动部署：**

1. 安装 Vercel CLI：
```bash
npm install -g vercel
```

2. 部署：
```bash
vercel --prod
```

### 部署到 Cloudflare Pages

1. 登录 [Cloudflare Pages](https://pages.cloudflare.com/)
2. 连接你的 GitHub 仓库
3. 配置构建设置：
   - **构建命令**: `pnpm run build`
   - **输出目录**: `dist`
   - **Node 版本**: `18`

### Docker 部署

**构建镜像：**

```bash
# 构建镜像
docker build -t vitepress-docs .

# 运行容器
docker run -d -p 80:80 vitepress-docs
```

**使用 Docker Compose：**

```yaml
version: '3'
services:
  docs:
    build: .
    ports:
      - "80:80"
    restart: unless-stopped
```

```bash
docker-compose up -d
```

### 推送到云镜像仓库

**腾讯云容器镜像服务：**

```bash
# 登录
docker login ccr.ccs.tencentyun.com

# 打标签
docker tag vitepress-docs ccr.ccs.tencentyun.com/namespace/vitepress-docs:latest

# 推送
docker push ccr.ccs.tencentyun.com/namespace/vitepress-docs:latest
```

**阿里云容器镜像服务：**

```bash
# 登录
docker login registry.cn-hangzhou.aliyuncs.com

# 打标签
docker tag vitepress-docs registry.cn-hangzhou.aliyuncs.com/namespace/vitepress-docs:latest

# 推送
docker push registry.cn-hangzhou.aliyuncs.com/namespace/vitepress-docs:latest
```

### 部署检查清单

部署前确保：
- ✅ 环境变量正确配置（`.env.production`）
- ✅ `VITE_SITE_URL` 设置为生产域名
- ✅ TypeScript 类型检查通过（`pnpm run typecheck`）
- ✅ 所有测试通过（`pnpm run test`）
- ✅ 构建成功无错误（`pnpm run build`）

---

## 🧪 测试

### 运行测试

```bash
# 运行所有测试
pnpm run test

# 观察模式（开发时使用）
pnpm run test:watch

# 生成覆盖率报告
pnpm run test:coverage
```

### 测试结构

```
tests/
├── config.test.ts        # 配置合并测试
└── validators.test.ts    # 配置验证测试
```

测试使用 [Vitest](https://vitest.dev/) 框架。

---

## 🤝 贡献指南

### 贡献流程

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: 添加某个功能'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

### 代码审查要点

提交 PR 前确保：
- ✅ TypeScript 类型检查通过（`pnpm run typecheck`）
- ✅ ESLint 检查通过（`pnpm run lint`）
- ✅ 所有测试通过（`pnpm run test`）
- ✅ 配置验证通过（启动开发服务器时自动执行）
- ✅ 没有改动已完工配置（`locales/`、`.env.*`、Husky 等）

### 开发约束

⚠️ **严禁修改以下已完工配置：**
- 国际化配置（`.vitepress/config/locales/`）
- 图表组件（Mermaid 配置）
- Git Hooks（`.husky/`）
- 环境变量（`.env.*`）
- 已完工的 CI/CD 工作流

详细开发规范请查看 [AGENTS.md](./AGENTS.md)。

---

## 📖 文档

### 项目文档
- [AGENTS.md](./AGENTS.md) - AI 协作开发指南
- [OPTIMIZATION.md](./.vitepress/config/OPTIMIZATION.md) - 配置优化说明
- [CHANGES.md](./.vitepress/config/CHANGES.md) - 变更日志
- [国际化架构说明](./.vitepress/config/locales/README.md)

### 官方文档
- [VitePress 官方文档](https://vitepress.dev/)
- [Vite 官方文档](https://vitejs.dev/)
- [TypeScript 官方文档](https://www.typescriptlang.org/)

---

## 🛡️ 技术栈

- **框架**: [VitePress](https://vitepress.dev/) 2.0.0-alpha.20
- **语言**: [TypeScript](https://www.typescriptlang.org/) 5.7.3
- **构建工具**: [Vite](https://vitejs.dev/) 8.3.2
- **包管理**: [pnpm](https://pnpm.io/) 11.22.0
- **代码检查**: [ESLint](https://eslint.org/) 10.11.0 (@antfu/eslint-config)
- **Git Hooks**: [Husky](https://typicode.github.io/husky/) 9.1.7
- **测试框架**: [Vitest](https://vitest.dev/)
- **图表支持**: [Mermaid](https://mermaid.js.org/) 12.0.0

---

## 📊 CI/CD

### GitHub Actions 工作流

- **ci.yml** - 代码质量检查（类型检查、Lint、测试）
- **deploy.yml** - 多平台自动部署（GitHub Pages、Vercel、Cloudflare）
- **docker-cloud.yml** - Docker 镜像构建和推送
- **deploy-gh-pages.yml** - GitHub Pages 专用部署
- **deploy-aliyun-oss.yml** - 阿里云 OSS 部署
- **deploy-tencent-cos.yml** - 腾讯云 COS 部署
- **release.yml** - 自动发布

所有工作流在推送到 `main` 分支时自动触发。

---

## 🐛 问题反馈

如果您发现任何问题或有改进建议，请：

1. 查看 [现有 Issues](https://github.com/your-username/your-repo/issues)
2. 如果问题未被报告，请 [创建新 Issue](https://github.com/your-username/your-repo/issues/new)

---

## 📝 更新日志

查看 [Releases](https://github.com/your-username/your-repo/releases) 了解详细更新记录。

---

## 📄 许可证

本项目采用 [MIT](./LICENSE) 许可证。

---

## 👥 贡献者

感谢所有为本项目做出贡献的开发者！

<a href="https://github.com/your-username/your-repo/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=your-username/your-repo" />
</a>

---

## ⭐ Star History

[![Star History Chart](https://api.star-history.com/svg?repos=your-username/your-repo&type=Date)](https://star-history.com/#your-username/your-repo&Date)

---

<div align="center">

**[⬆ 回到顶部](#vitepress-多语言文档站点)**

Made with ❤️ by [Your Team](https://github.com/your-username)

</div>
