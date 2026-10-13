import type { MenuText } from '../../../../i18n/types'
import type { developmentNav } from '../../../../nav/demo/development'

export const development = {
  'nav.demo.development': 'Phát triển',
  'nav.demo.development.1': 'Markdown',
  'nav.demo.development.2': 'Thành phần',
  'nav.demo.development.3': 'Bố cục',
  'nav.demo.development.4': 'Kiểu dáng',
  'nav.demo.development.5': 'Biểu đồ',
} satisfies MenuText<readonly [typeof developmentNav]>
