# Docker 模板

- shared：基础构建阶段、独立运行入口与通用忽略规则。
- dev：开发阶段片段。
- image：static/node 生产阶段片段及静态 Nginx 配置。
- compose：基础编排、开发及生产覆盖模板。

生成器位于 lib/docker；按用途和实际应用参数渲染，仅输出所选配置。不会创建应用、推送镜像或连接服务器。
