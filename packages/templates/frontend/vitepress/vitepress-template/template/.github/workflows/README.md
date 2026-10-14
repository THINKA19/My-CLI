# 工作流分类

工作流 YAML 保留在本目录，GitHub Actions 通过 `name` 显示职责分类。

任务和步骤均使用中文显示名，平台品牌及 Action 标识保持原名。
统一使用 Node.js 24、pnpm 11.27.1；执行前检查锁文件与部署脚本。
若提示文件缺失，应提交完整生成项目，不要临时生成锁文件绕过冻结安装。
更新已有项目时须同步 scripts/deploy、tests/deploy、eslint.config.js 及根目录依赖配置，
仅替换本目录不能解决脚本缺失或 ESLint 规则不一致。

| 分类 | 文件 | 触发与作用 |
| --- | --- | --- |
| 检查 | ci.yml | main 推送和 PR：代码、类型、构建检查 |
| 测试 | test-deploy.yml | main 推送、PR 或手动：全平台静态适配与 Docker HTTP 测试，不发布 |
| 网站部署入口 | release.yml | PAGES_ENABLED=true 时自动发布，或手动发布 Pages |
| 网站部署执行 | deploy-gh-pages.yml | 仅由 Pages 入口调用 |
| 网站部署 | deploy-vercel.yml | VERCEL_ENABLED=true 时自动发布，或手动发布 |
| 网站部署 | deploy-cloudflare.yml | CLOUDFLARE_ENABLED=true 时自动发布，或手动发布 |
| 网站部署 | deploy-aliyun-oss.yml | main 推送时检查选择，OSS_ENABLED=true 时发布，或手动发布 |
| 网站部署 | deploy-tencent-cos.yml | main 推送时检查选择，COS_ENABLED=true 时发布，或手动发布 |
| 镜像发布 | docker-cloud.yml | 只推送已启用的镜像仓库目标 |
| 服务器部署 | deploy.yml | 被镜像工作流调用，或手动运行；必须开启 SERVER_DEPLOY_ENABLED |

尚未选择平台时不设置任何 ENABLED 变量，部署保持跳过，CI 继续执行。
每个部署入口先执行“部署选择与状态说明”，在 Summary 写明选择结果。
选择任务成功仅表示选择逻辑完成；必须查看后续部署任务是否真正运行和成功。
Docker 只为已开启的目标创建镜像推送任务，不再为三个未启用目标创建空跑绿勾。
手动运行 Docker 却没有开启任何镜像目标时明确失败。
可同时启用多个平台。手动运行静态部署代表明确选择该平台，仍必须通过配置检查。
Docker 手动运行仍遵循镜像目标的启用开关；服务器手动运行直接选择服务器部署。

新增全平台测试后共有十个 YAML，新增文件属于测试入口，不是另一个部署目标。
部署测试范围和云端验收见 [测试指南](../../docs/ai/DEPLOYMENT_TESTING.md)。
