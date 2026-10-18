# AGENTS.md

本文件为 AI 助手提供脚手架 CLI 的维护说明。此目录是 npm 包 `@dengzhibo/create-vitepress-template`，用于生成 VitePress 文档项目。

## 主要内容

- `bin/index.js`：CLI 入口，参数解析、交互确认和按需安装依赖。
- `lib/options.js`：选项校验与只读 workspace 检测；`lib/prompts.js`：终端问答。
- `lib/generate.js`：先组装文件计划，再校验目录并写入；依赖和命令按功能合并。
- `templates/`：基础、国际化、工程化、Mermaid 和部署模块；基础站点约束见 `templates/base/AGENTS.md`。
- `tests/legacy/`：迁移前的部署及国际化测试、参考说明；不是生成项目内容。
- `.agents/skills/vitepress/` 与 `skills-lock.json`：本包开发辅助技能及来源锁定，不作为模板发布或生成。
- `templates/.npmignore`：排除模板内的依赖、缓存和本地环境文件。
- `package.json`：CLI 命令、打包范围和发布配置。

## 常用命令

在当前目录执行：

- `pnpm help`：查看 CLI 用法。
- `node bin/index.js [创建位置]`：交互生成；默认当前目录。
- `node bin/index.js <创建位置> --yes [选项]`：自动化生成，默认不启用可选功能。
- `node --test tests/*.test.mjs`：生成逻辑与交互分支测试。
- 设置 `VITEPRESS_TEST_NODE_MODULES` 为已安装完整模板依赖的 node_modules 绝对路径，可运行真实构建与回归测试。

当前只迁移已有能力，不新增 GSAP、部署平台或服务器静态文件部署。模板只维护 `templates/`，不恢复旧 `template/`。生成临时项目并安装完整依赖后，可将该依赖路径传入集成测试。
