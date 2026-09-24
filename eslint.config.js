import antfu from '@antfu/eslint-config'

export default antfu({
  /**
   * 对 markdown 内的代码块关掉某些过于严格的规则
   * （自动对 .md 文件及其内部的代码块应用专用的 Lint 规范）
   */
  markdown: true,

  /**
   * 自定义 ESLint 规则覆盖
   */
  rules: {
    // 允许使用 Node.js 全局对象 process（避免频繁 import process）
    'node/prefer-global/process': 'off',
    // 允许使用 Node.js 全局对象 Buffer（避免频繁 import Buffer）
    'node/prefer-global/buffer': 'off',
  },

  /**
   * 全局文件/目录忽略匹配规则
   */
  ignores: [
    '**/README.md', // 忽略项目中的 README 说明文件
    '**/*.md', // 忽略所有的 Markdown 格式文档
    '**/template/**', // 忽略脚手架模板生成目录（防止模板插值语法影响 Lint）
    '**/node_modules/**', // 忽略第三方依赖包目录
    '**/dist/**', // 忽略构建产物输出目录
    '**/.vitepress/**', // 忽略 VitePress 文档站点的本地配置与缓存目录
  ],
})
