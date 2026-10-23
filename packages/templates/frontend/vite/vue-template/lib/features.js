export const featureModules = {
  'code-quality': { label: '代码规范', directory: 'code-quality' },
  'unit-test': { label: '单元测试', directory: 'Vitest' },
  'e2e': { label: '端到端测试', directory: 'e2e' },
  'jsx': { label: 'JSX 支持', directory: 'JSX' },
  'theme': { label: '主题配置', directory: 'theme', install: '@/features/theme/setup', demo: '@/features/theme/ThemeDemo.vue' },
  'i18n': { label: '国际化', directory: 'i18n', install: '@/features/i18n/setup', demo: '@/features/i18n/LocaleDemo.vue' },
  'tools': { label: '通用工具与组合函数', directory: 'tools', demo: '@/features/tools/ToolsDemo.vue' },
  'analyze': { label: '构建分析', directory: 'analyze', vite: './analyze.ts' },
  'diagnostics': { label: '错误诊断', directory: 'diagnostics', install: '@/features/diagnostics/setup', demo: '@/features/diagnostics/DiagnosticsDemo.vue' },
  'deployment': { label: '部署配置示例', directory: 'deployment' },
}
export const featureLabels = Object.fromEntries(Object.entries(featureModules).map(([key, value]) => [key, value.label]))
