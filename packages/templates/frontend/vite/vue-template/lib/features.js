export const featureGroups = { basic: '基础开发配置', enhanced: '通用功能增强' }

export const featureModules = {
  'code-quality': { label: '代码规范', group: 'basic', directory: 'code-quality' },
  'unit-test': { label: '单元测试', group: 'basic', directory: 'Vitest' },
  'e2e': { label: '端到端测试', group: 'basic', directory: 'e2e' },
  'jsx': { label: 'JSX 支持', group: 'basic', directory: 'JSX' },
  'theme': { label: '主题配置', group: 'enhanced', directory: 'theme', install: '@/features/theme/setup', demo: '@/features/theme/ThemeDemo.vue' },
  'i18n': { label: '国际化', group: 'enhanced', directory: 'i18n', install: '@/features/i18n/setup', demo: '@/features/i18n/LocaleDemo.vue' },
  'tools': { label: '通用工具与组合函数', group: 'enhanced', directory: 'tools', demo: '@/features/tools/ToolsDemo.vue' },
  'analyze': { label: '构建分析', group: 'enhanced', directory: 'analyze', vite: './analyze.ts' },
  'diagnostics': { label: '错误诊断', group: 'enhanced', directory: 'diagnostics', install: '@/features/diagnostics/setup', demo: '@/features/diagnostics/DiagnosticsDemo.vue' },
  'deployment': { label: '部署配置示例', group: 'enhanced', directory: 'deployment' },
}
export const featureLabels = Object.fromEntries(Object.entries(featureModules).map(([key, value]) => [key, value.label]))

export function featuresInGroup(group) {
  return Object.keys(featureModules).filter(feature => featureModules[feature].group === group)
}
