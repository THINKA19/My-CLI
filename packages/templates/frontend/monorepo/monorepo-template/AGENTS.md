# CLI 开发与维护指南

本包为 @dengzhibo/create-monorepo-template。

- bin/index.js 仅编排流程。lib/options.js、prompts.js、generate.js 维护选项、交互和生成。
- lib/deploy/ 维护目标增删改查、工作流模板渲染、文件安装；不要把平台执行代码写进管理入口。
- templates/base 是默认模板；features/docker 是可选容器示例；features/deploy 按 shared 和各平台分类。
- 各平台维护独立执行脚本、package.fragment.json 和工作流 .tpl 文件；shared 仅维护跨平台公共职责。
- 生成项目 deploy/tools 和 deploy/templates 支持后续离线添加平台；scripts/deploy 是实际执行代码，按选择安装。
- 不在 templates 内安装依赖，使用临时生成项目验证。
- 保护已有脚本和修改过的工作流，凭据只使用环境变量或 Secrets。
- node --test tests/*.test.mjs 验证；node scripts/check-package.mjs 检查发布范围。
