# 开发约定

- 页面：src/app/pages；路由及标题：src/app/router。
- UI 库接入：src/ui；HTTP 实例与接口：src/http。
- 公共环境配置：src/shared/config。所有 VITE_ 变量会进入浏览器产物，不能放密钥。
- 复制 .env.example 为 .env.development.local，按需设置 DEV_PROXY_TARGET；开发代理保留 /api 前缀，仅开发时有效。
- 生产接口地址在构建时确定；生产反向代理由 Web 服务器配置。子目录部署设置 VITE_APP_BASE=/app/ 并同步服务器路径。
- Mock 使用 publicUrl('mock/hello.json')，始终请求应用静态资源地址，与 API 地址独立。
- Vue DevTools 只在开发服务中启用；生产构建不启用。使用浏览器 Network、Vue DevTools、断点排查页面和请求。
- 新增接口保持库的原生用法；HTTP 错误在 src/http/errors.ts 分类，取消请求通常无需弹窗。
- 文件上传下载示例在 src/http/files.ts，需要真实服务端接口；不要手动设置 multipart 边界。
- 移动端样式处理安全区域和动态视口；PC 示例采用最小 768px 宽度。表格外层使用 scroll-region。
- 路由采用懒加载，404 可返回首页；权限策略由具体业务定义。
- 源码按职责组织，避免持久化 Token、个人数据或大对象到公共存储工具。

业务接口路径相对于 VITE_API_BASE_URL，例如 /api 对应 client.get('users')，不要再次拼接 /api；上传下载同理。完整 HTTP(S) URL 用于显式跨源接口。
