import type { MenuText } from '#config/i18n/types'
import type { developmentNav } from '#config/nav/development'

export const development = {
  'nav.development': 'Phát triển',
  'nav.development.1': 'Markdown',
  'nav.development.2': 'Thành phần',
  'nav.development.3': 'Bố cục',
  'nav.development.4': 'Kiểu dáng',
  'nav.development.5': 'Biểu đồ',
} satisfies MenuText<readonly [typeof developmentNav]>
