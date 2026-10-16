# VitePress 交互式脚手架

`@dengzhibo/create-vitepress-template`：按需生成文档项目。基础版为单语言站点，可选国际化、代码检查、Mermaid、Docker 和已有部署平台。

## 创建项目

```sh
pnpm dlx @dengzhibo/create-vitepress-template
pnpm dlx @dengzhibo/create-vitepress-template my-docs
pnpm dlx @dengzhibo/create-vitepress-template .
```

创建位置默认 `.`：直接回车在当前目录创建；输入 `my-docs` 新建子目录，也可输入 `apps/docs` 等路径。目标必须为空，允许保留 `.git`，不会覆盖现有文件。

固定选项使用 ↑↓ 选择，Space 多选，Enter 确认；Ctrl+C / Esc 取消。正式确认前不会创建项目文件，返回修改会保留答案。

## 问答顺序

1. **项目创建位置**：输入目录或使用当前目录。
2. **国际化配置**：默认关闭。关闭后单选中文、英文或越南语；开启后至少勾选两种语言，再从所选语言中单选默认语言。
3. **代码质量与检查**：ESLint、Git 提交检查、GitHub Actions CI，多选且默认空选。
4. **内容与交互增强**：Mermaid 图表，默认空选；不包含尚未接入的 GSAP。
5. **部署目标与容器支持**：GitHub Pages、Vercel、Cloudflare Pages、阿里云 OSS、腾讯云 COS、自有服务器；另有 Docker 本地构建与预览。可全部不选。
6. **必要追问**：按已选目标选择已有自动部署流程；需要发布镜像时选择阿里云 ACR、腾讯云 TCR 或 Docker Hub。
7. **是否安装依赖**：默认暂不安装。
8. **配置摘要**：开始创建、返回修改或取消。

GitHub Pages、自有服务器沿用现有 GitHub Actions 部署；自有服务器自动包含 Docker，且需要镜像仓库。其他平台未选自动部署时仅提供已有脚本或接入说明。只生成配置，不立即发布，不创建云资源。

## 自动化创建

使用 `--yes` 跳过问答，未指定的可选功能均不启用：

```sh
# 单语言基础版
node bin/index.js my-docs --yes --languages=en

# 多语言 + Mermaid + 代码检查 + GitHub Pages
node bin/index.js my-docs --yes --i18n --languages=zh,en --default-language=zh --enhancements=mermaid --features=eslint,git-hooks,ci --targets=github-pages --automation=github-pages

# Docker 镜像发布及自有服务器部署
node bin/index.js my-docs --yes --targets=server --automation=server --registries=dockerhub

node bin/index.js --help
```

生成项目使用 Node.js 24、pnpm 11。依赖沿用现有版本，按所选功能合并 `package.json`；独立项目锁文件保留现有解析版本并筛选直接依赖。首次运行 `pnpm install` 后，应将匹配的锁文件一并提交，供 CI 和 Docker 冻结安装。

## 已有 workspace

不询问“独立项目 / Monorepo 子项目”。检测到父级 pnpm workspace 后，不生成子项目锁文件、workspace 配置和包管理器限制脚本，也不修改根配置。请确认路径已包含在 workspace 的 `packages` 范围内。

当前不自动改写仓库根目录的 Git hooks、CI/CD 或 Docker 构建上下文；这些能力由根目录接入。其他包管理器 workspace 暂不支持。

## 开发与验证

```sh
node --test tests/*.test.mjs
node bin/index.js --help
node scripts/check-package.mjs
```

设置 `VITEPRESS_TEST_NODE_MODULES` 为一套已安装完整模板依赖的 `node_modules` 绝对路径，可执行真实菜单、类型、构建和原有回归测试。未设置时跳过这些依赖较重的集成测试。

架构说明见 [内部架构设计](docs/0.9-MODULAR-GENERATION.md)，开发资料与发布边界见 [模板资料归属](docs/TEMPLATE-ASSETS.md)。每个脚手架包独立发布，使用 `pnpm publish --access public`。
