# Vue + Vite 模板脚手架

生成现有 Vue + Vite + TypeScript 应用，保留 Router、Pinia 和 Vue DevTools。

## 用户使用（发布到 npm 后）

```sh
pnpm create @dengzhibo/vue-template@latest my-vue-app

# 等价的完整包名调用
pnpm dlx @dengzhibo/create-vue-template@latest my-vue-app

# 全选并安装依赖
pnpm create @dengzhibo/vue-template@latest my-vue-app --yes "--features=code-quality,unit-test,e2e" --install

# 不选任何功能，不安装依赖
pnpm create @dengzhibo/vue-template@latest my-vue-app --yes --features=
```

以上命令会从 npm 获取并运行脚手架，无需下载源码或全局安装；必须先发布对应包。`--install` 控制的是生成项目的依赖安装，不是脚手架自身的下载。每个示例独立执行，请使用空目录。

命令说明：[pnpm create](https://pnpm.io/cli/create)、[pnpm dlx](https://pnpm.io/cli/dlx)。

项目名取目标目录名，支持 my-vue-app 等带连字符名称；目录参数可使用相对路径、绝对路径或当前目录 .。目标目录必须为空，允许保留 .git。

向导顺序：创建位置 → 功能多选 → 是否安装依赖 → 确认、返回修改或取消。

功能默认全部不选，Space 勾选，Enter 确认，可任意组合：

- 代码规范（code-quality）：ESLint + Oxlint + Oxfmt。
- 单元测试（unit-test）：Vitest、Vue Test Utils 和现有测试示例。
- 端到端测试（e2e）：Playwright 和现有测试示例。

Windows PowerShell 中，包含逗号的 `--features` 参数应加引号，如上例。

--yes 使用非交互模式；--features= 指定逗号分隔的功能，空值为全部不选；--install 执行 pnpm install，默认不安装。

未选择的功能不生成对应配置、依赖、脚本或编辑器推荐。测试的 ESLint 规则仅在代码规范与相应测试同时选择时生成。

不生成 Git hooks、CI、Docker 或部署管理。基础模板现有 Vue RC 与 TypeScript bridge 覆盖保持原样；本次仅拆分现有能力。

CLI Node 要求见 package.json；生成应用的 Node 要求见 templates/base/package.json。

## 源码开发与维护

仅在本包源码目录中使用以下命令进行本地调试：

```sh
node bin/index.js my-vue-app
```

验证：

```sh
node --test tests/*.test.mjs
node scripts/check-package.mjs
```

测试覆盖 8 种功能组合、CLI 参数、向导返回修改、取消及目标目录保护。不要在 templates 内安装依赖。

## 发布文件范围

`bin/`、`lib/`、`templates/`、README、CHANGELOG、LICENSE 与 package.json 随 npm 包发布。测试、预检脚本、AGENTS.md 和本地缓存仅用于仓库维护，不需要上传 npm。`_gitignore` 在生成项目时恢复为 `.gitignore`。

未指定目录时默认在当前目录 `.` 创建，生成包名为 `vue-project`；指定目录时使用目录名作为包名。生成项目版本与本脚手架根 package.json 的版本一致。
