/**
 * Commitlint 提交信息规范配置
 * 继承预设支持的 commit type 说明：
 *  - feat     : 新增功能 (feature)
 *  - fix      : 修复 Bug
 *  - docs     : 仅修改文档 (documentation)
 *  - style    : 代码格式变动（不影响逻辑，如空格、分号等）
 *  - refactor : 代码重构（既非修复 Bug 也非新增功能的变动）
 *  - perf     : 性能优化 (performance)
 *  - test     : 新增或修改测试代码
 *  - build    : 构建系统或外部依赖变更（如 npm/pnpm、vite 等配置）
 *  - ci       : CI/CD 持续集成配置变更（如 GitHub Actions、Docker 等）
 *  - chore    : 构建过程、辅助工具或非业务逻辑的变动
 *  - revert   : 撤销/回退之前的 Commit
 */
export default {
  extends: ['@commitlint/config-conventional'],
}
