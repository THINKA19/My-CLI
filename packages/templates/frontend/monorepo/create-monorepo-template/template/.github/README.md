# GitHub 自动化说明

本目录存放 GitHub Actions 的配置，用于自动构建、发版和部署。

## 目录结构

```plain
template/.github/
├── actions/
│   └── setup/
│       └── action.yml    # [复合 Action] 跨 Workflow 复用的基础环境初始化配置（配置 Node.js、pnpm 及其依赖缓存）
├── workflows/
│   ├── ci.yml            # [持续集成] 代码提交与 PR 质量门禁（运行代码检查、类型校验、单元测试及构建验证）
│   ├── deploy.yml        # [持续部署] 生产/预发环境自动化部署流程（如将 apps/web 部署至 Vercel、Cloudflare 或服务器）
│   └── release.yml       # [版本发布] 自动化语义化版本发布流程（结合Changesets自动打Tag、生成Changelog及发布 npm 包）
├── dependabot.yml        # [安全运维] GitHub 依赖自动更新配置（定时检测 package.json 及 Actions 版本并自动拉取 PR）
└── README.md             # [文档说明] CI/CD 架构与运维指南（说明环境变量/Secrets 配置、工作流触发机制及本地调试方法）
```

## 目录说明

| 文件                       | 作用                         |
| -------------------------- | ---------------------------- |
| `workflows/ci.yml`         | 代码检查与构建，自动运行     |
| `workflows/release.yml`    | 打 Tag 时创建 GitHub Release |
| `workflows/deploy.yml`     | 部署，默认手动触发           |
| `actions/setup/action.yml` | 三个流程共用的"准备环境"步骤 |
| `dependabot.yml`           | 每周自动检查依赖更新并提 PR  |

## 使用前必做

CI 使用 `pnpm install --frozen-lockfile`，需要先有 `pnpm-lock.yaml`：

```bash
pnpm install
git add pnpm-lock.yaml
git commit -m "chore: add lockfile"
```

另外确认仓库主分支叫 `main`。如果是 `master`，请修改 `workflows/ci.yml` 里的 `branches`。

## 各流程怎么用

### CI（自动）

推送到 `main` 或提交 Pull Request 时自动运行，执行 `pnpm build`。在仓库的 Actions 页面可以查看结果。

### 发版（打 Tag）

```bash
git tag v1.0.0
git push origin v1.0.0
```

推送后会自动构建，并在仓库的 Releases 页面生成发布记录。Tag 必须以 `v` 开头。

### 部署（手动）

1. 打开仓库的 Actions 页面
2. 选择 Deploy，点击 Run workflow

`deploy.yml` 里的部署步骤目前是占位，需要你自己补充：

1. 在 Settings > Secrets and variables > Actions 中添加所需密钥（如服务器地址、SSH 私钥）
2. 在 `deploy.yml` 的部署步骤里用 `${{ secrets.密钥名 }}` 引用
3. 需要自动部署时，把触发条件改为 push 到 `main`

## 常见问题

**CI 报错 lockfile 相关**：说明没有提交 `pnpm-lock.yaml`，或修改了依赖却没重新生成，本地执行 `pnpm install` 后提交即可。

**提示 Action 版本过旧**：Dependabot 会自动提 PR 更新版本，合并即可。