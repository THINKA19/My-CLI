# Monorepo 脚手架

基于 pnpm workspace + Turborepo 的仓库骨架。默认包含前后端分类目录、共享包预留目录、ESLint、Husky、commitlint 和 GitHub Actions CI。尚未创建具体应用。

## 创建

```sh
node bin/index.js my-repo
node bin/index.js my-repo --yes
node bin/index.js my-repo --yes --docker --deploy
node bin/index.js my-repo --yes --deploy-config=target.json
```

交互时可启用 Docker 示例和部署管理，并连续添加多个初始目标。`--cd` 保留为 `--deploy` 的兼容别名。Ctrl+C 取消，最终确认前不创建项目。Docker 示例需要适配实际应用。

## 在已有仓库添加部署

初次创建未选部署也可以后续添加。在目标仓库根目录执行：

```sh
pnpm dlx @dengzhibo/create-monorepo-template deploy add
# 本地源码开发时使用 node /绝对路径/bin/index.js deploy add
```

启用后可直接使用仓库内的管理器（注意使用 pnpm run，避免与 pnpm 内置 deploy 命令冲突）：

```sh
pnpm run deploy add
pnpm run deploy list
pnpm run deploy edit admin-production
pnpm run deploy remove admin-preview
pnpm run deploy run admin-production --dry-run
pnpm run deploy run admin-production
```

非交互操作：`deploy add --config target.json`、`deploy edit admin-production --config target.json`。

## 目标配置

每个目标独立保存为 `deploy/targets/<名称>.json`，可针对同一应用创建不同环境或平台目标。

```json
{
  "version": 1,
  "name": "admin-production",
  "platform": "oss",
  "environment": "production",
  "app": "apps/frontend/admin",
  "build": "pnpm --filter admin... build",
  "output": "apps/frontend/admin/dist",
  "bucket": "your-bucket",
  "region": "oss-cn-hangzhou",
  "prefix": "admin",
  "trigger": "manual"
}
```

应用可以稍后创建，实际执行前必须存在。构建命令从仓库根目录执行，产物路径也相对根目录。Secrets 不写入 JSON。

| 平台 | 配置补充 | GitHub Environment Secrets |
| --- | --- | --- |
| github-pages | output | 使用 Actions OIDC；仓库 Pages 来源需设为 GitHub Actions |
| vercel | output（仅静态产物） | VERCEL_TOKEN、VERCEL_ORG_ID、VERCEL_PROJECT_ID |
| cloudflare | output、project | CLOUDFLARE_API_TOKEN、CLOUDFLARE_ACCOUNT_ID |
| oss | output、bucket、region、prefix | OSS_ACCESS_KEY_ID、OSS_ACCESS_KEY_SECRET |
| cos | output、bucket、region、prefix | COS_SECRET_ID、COS_SECRET_KEY |
| registry | image、dockerfile、context | REGISTRY_USER、REGISTRY_PASSWORD |
| server | image、container、可选 runArgs 数组 | SERVER_HOST、SERVER_USER、SERVER_SSH_KEY、SERVER_KNOWN_HOSTS |

registry/server 的 image 必须是完整地址，例如 `docker.io/team/api:version`。服务器预装 Docker 并配置镜像仓库访问权限；runArgs 例如 `["-p", "3000:3000"]`。服务器容器替换会短暂停机，不包含健康检查回滚。

每个目标生成独立工作流，默认手动执行；设置 `trigger: "push"`、`branch: "main"` 可启用自动部署，`paths` 数组可限定变更范围。路径规则应覆盖共享包和根配置，未设置时监听分支全部变更。在 Actions 中也可手动选择目标。Secrets 放目标 environment 对应的 GitHub Environment。添加 OSS/COS 后运行 `pnpm install` 并提交根锁文件。Vercel/Wrangler 命令需要联网获取平台 CLI。

Pages 每仓库只有一个站点，因此只允许一个 Pages 目标；多个应用需要先构建聚合到同一输出目录。OSS/COS 多目标需使用不同 bucket/prefix 避免路径覆盖。上传不删除云端旧文件。

工具通过哈希保护生成工作流，用户修改后拒绝覆盖和删除。删除目标保留共享运行器、依赖和云端资源。基础应用、CI、Lint 和其他用户脚本不重建。

## 开发与验证

```sh
node --test tests/*.test.mjs
pnpm test:pack
```

`templates/base` 是默认模板，`templates/features/docker` 是 Docker 示例，`templates/features/deploy` 按 shared、oss、cos、github-pages、vercel、cloudflare、registry、server 分类。每个平台保留独立脚本、依赖片段和工作流模板；VitePress 原稿在 docs/reference，不发布。

本地测试可验证配置、生成和执行控制流。真实平台权限、上传结果、GitHub Actions 和服务器运行情况需要对应云账号进行验收；dry-run 不代表部署成功。

## 代码职责与生成目录

- bin/index.js：薄命令入口。
- lib/options.js、prompts.js、generate.js：选项、交互、创建计划。
- lib/deploy/：目标管理、模板渲染、文件安装和管理命令。
- scripts/check-package.mjs：发布预检，执行 pnpm test:pack。
- templates/features/deploy/shared/scripts/deploy：通用构建、校验、上传工具和薄执行入口。
- 各平台目录：平台脚本、package.fragment.json、独立 .github/workflows/*.yml.tpl。

生成后，scripts/deploy 存放公共工具和已选择的平台执行脚本；deploy/targets 存放目标配置；deploy/tools 存放离线管理工具；deploy/templates 存放可供以后添加平台的模板目录。模板目录不参与实际部署，不安装未选择平台的 SDK。deploy/manage.mjs 只负责调用管理命令，平台工作流调用 scripts/deploy/run.js。

已有集中式 manage.mjs 的旧生成项目不会被静默覆盖；请先备份配置、审查迁移，使用新生成的模块化工具替换后再继续管理。
