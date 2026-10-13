import type { MenuText } from '../../../../i18n/types'
import type { developmentNav } from '../../../../nav/demo/development'

export const development = {
  'nav.demo.development': '开发',
  'nav.demo.development.1': 'Markdown',
  'nav.demo.development.2': '组件',
  'nav.demo.development.3': '布局',
  'nav.demo.development.4': '样式',
  'nav.demo.development.5': '图表',
} satisfies MenuText<readonly [typeof developmentNav]>
