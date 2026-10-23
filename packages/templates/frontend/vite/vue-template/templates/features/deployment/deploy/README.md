# 静态部署示例

1. 确定生产环境的 VITE_API_BASE_URL、VITE_APP_VERSION 和 VITE_APP_BASE，然后运行 pnpm build。
2. 根路径部署：将 dist 内容放到 nginx.conf 的 root 目录。子目录部署：按 nginx.subpath.conf 的说明构建并放置文件。
3. 修改 server_name 和 API upstream，运行 nginx -t 检查，再由运维部署配置。示例不会操作服务器。
4. 检查深层路由直接访问、404、静态文件缺失返回 404、API 状态码、Mock 数据地址。
5. index.html 不长期缓存，带 hash 的 assets 长期缓存。版本回滚时保留旧资源直至缓存过期。
6. HTTPS、域名证书、访问控制按实际托管环境设置。DEV_PROXY_TARGET 对生产无效。
