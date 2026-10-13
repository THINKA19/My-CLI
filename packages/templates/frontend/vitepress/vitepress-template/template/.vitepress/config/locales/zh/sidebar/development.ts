import type { MenuText } from '#config/i18n/types'
import type { developmentSidebar } from '#config/sidebar/development'

export const development = {
  'sidebar.development': '开发',
  'sidebar.development.1': 'Markdown',
  'sidebar.development.2': '组件',
  'sidebar.development.3': '布局',
  'sidebar.development.4': '样式',
  'sidebar.development.5': '图表',
  'sidebar.development.6': '数据',
  'sidebar.development.7': '类型',
  'sidebar.development.8': '测试',
  'sidebar.development.9': '调试',
  'sidebar.development.10': '维护',
  'sidebar.development.basic': '基础',
  'sidebar.development.advanced': '进阶',
} satisfies MenuText<typeof developmentSidebar>
