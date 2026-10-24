# 构建与产物检查

本文保留本项目约定的命令、环境变量、体积阈值和归档要求。执行前核对目标工程的 package.json、环境校验与脚本实现；缺失时报告未接入，不能宣称这些能力已经可用，也不擅自用其他命令替代验收。构建检查、上传和发布分别报告结果，上传或发布仅在用户任务明确授权时执行。

版本取 package.json；RELEASE_VERSION 可覆盖本次发布版本，上传脚本会传递此值。
manifest versionCode 是商店要求的单调数值，独立维护，不从语义版本推测。
每个构建输出 build-info.json，包含版本、提交、工作区状态、平台、环境、数据来源、构建时间和 buildId。
Track 将相同构建信息附在事件上，缓存恢复时保留原始构建标识。

使用 `pnpm build:check dist/build/h5` 检查指定产物。
使用 `pnpm build:verify h5 mp-weixin` 构建并检查指定平台；默认检查 H5、微信、抖音、App 编译产物，不等于实机验收。
真实服务构建须明确 VITE_RELEASE_TARGET=service 和 VITE_DATA_SOURCE=real。
检查按 Mock 特征及调试特征扫描脚本产物，不能证明不存在所有形式的调试内容。

使用 `pnpm build:check dist/build/h5 --baseline` 显式建立或更新经审核的体积基线。
基线按平台、环境、数据来源区分；总大小增长超过 15% 时检查失败。尚无基线会提示，不自动把任意构建视为合格基线。
使用 `pnpm build:check dist/build/h5 --archive` 归档产物与 SHA256 文件清单到 releases/<buildId>。
归档要求有干净 Git 提交，禁止覆盖同一归档。微信上传前执行检查和归档；归档记录构建产物，不代表上传或发布已成功。
