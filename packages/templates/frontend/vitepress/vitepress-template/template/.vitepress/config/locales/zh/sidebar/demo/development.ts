import type { MenuText } from '../../../../i18n/types'
import type { developmentSidebar } from '../../../../sidebar/demo/development'

export const development = {
  'sidebar.demo.development': '开发',
  'sidebar.demo.development.1': 'Markdown',
  'sidebar.demo.development.2': '组件',
  'sidebar.demo.development.3': '布局',
  'sidebar.demo.development.4': '样式',
  'sidebar.demo.development.5': '图表',
  'sidebar.demo.development.6': '数据',
  'sidebar.demo.development.7': '类型',
  'sidebar.demo.development.8': '测试',
  'sidebar.demo.development.9': '调试',
  'sidebar.demo.development.10': '维护',
  'sidebar.demo.development.basic': '基础',
  'sidebar.demo.development.advanced': '进阶',
} satisfies MenuText<typeof developmentSidebar>
