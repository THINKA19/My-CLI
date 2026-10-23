# 可选通用模块

- theme：公共设计变量、品牌色与明暗偏好；src/ui/ThemeBridge.vue 接入所选库的 Provider 或 CSS 变量。切换系统偏好会同步生效，卸载清理监听。
- i18n：Composition API，中英文消息、UTC 日期和数字格式。切换语言影响示例和 document.lang；新增业务页面应使用 t/d/n，不自动翻译组件库或全部既有示例。
- tools：精选小工具，不依赖大型工具包。存储读取需要类型校验，写入失败返回 false。不要存储凭证。
- analyze：pnpm analyze 输出根目录 stats.html；报告可能包含源码路径，分享前审阅，默认不随 dist 发布。
- diagnostics：reportError 收集最小消息、来源、时间和版本。URL 与常见凭证键脱敏，不收集堆栈或页面 URL；业务个人信息需要调用方进一步清洗。生产默认不输出，setDiagnosticReporter 可接团队服务。
- deployment：示例只提供配置与说明，实际域名、TLS、上游及服务器操作由部署环境决定。

开启哪些模块由脚手架 features 决定。测试与模块同时选择时，生成对应行为测试。配置和示例不包含业务登录、权限或服务端约定。
