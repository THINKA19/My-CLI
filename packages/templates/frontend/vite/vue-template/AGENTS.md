# Vue CLI 开发与维护指南

本包为 @dengzhibo/create-vue-template。

- bin/index.js 只编排流程；lib/options.js、prompts.js、generate.js 分别维护参数、交互和生成。
- templates/base 保留 Vue + Vite 应用基础；features/code-quality、Vitest、e2e、JSX 是四个可选模块。
- 功能多选允许全不选或全选；默认不选。保持配置、依赖、脚本、TS references、编辑器设置和说明同步。
- 不添加 Git hooks、CI、Docker 或部署管理。
- 不在 templates 内安装依赖，使用临时生成项目验证。
- node --test tests/*.test.mjs 验证；node scripts/check-package.mjs 检查发布范围。
