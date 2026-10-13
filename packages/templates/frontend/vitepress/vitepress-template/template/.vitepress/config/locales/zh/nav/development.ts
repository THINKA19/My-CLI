import type { MenuText } from '#config/i18n/types'
import type { developmentNav } from '#config/nav/development'

export const development = {
  'nav.development': '开发',
  'nav.development.1': 'Markdown',
  'nav.development.2': '组件',
  'nav.development.3': '布局',
  'nav.development.4': '样式',
  'nav.development.5': '图表',
} satisfies MenuText<readonly [typeof developmentNav]>
