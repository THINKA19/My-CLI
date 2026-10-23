# 模块边界与维护

- base：环境、基础样式、路由、HTTP 错误类型与公共示例。
- platform/mobile、platform/admin：随项目类型生成平台样式。
- ui/h5、ui/pc：各组件库维护初始化、依赖和示例。
- http：Axios 与 Alova 保留原生 API，统一演示数据约定。
- features：可选模块声明 package.fragment.json，可通过 lib/features.js 声明应用安装入口、示例组件或 Vite 插件入口。
- 相同目标文件或不同版本的依赖会报错。模块不要覆盖公共模板。
- 新模块要更新标签、依赖、文档及组合验证；不要带入真实凭证或业务 API。
- 安装入口导出 install(app)，Vite 分析入口导出 analyzePlugin()。生成器组合入口，应用中不需要条件导入。

空目录按需由开发者创建，不使用 .gitkeep 占位。只有选中的模块需要安装入口、示例或 Vite 插件时，生成器才输出对应聚合文件。
