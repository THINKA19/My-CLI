import type { MenuText } from '#config/i18n/types'
import type { developmentSidebar } from '#config/sidebar/development'

export const development = {
  'sidebar.development': 'Phát triển',
  'sidebar.development.1': 'Markdown',
  'sidebar.development.2': 'Thành phần',
  'sidebar.development.3': 'Bố cục',
  'sidebar.development.4': 'Kiểu dáng',
  'sidebar.development.5': 'Biểu đồ',
  'sidebar.development.6': 'Dữ liệu',
  'sidebar.development.7': 'Kiểu',
  'sidebar.development.8': 'Kiểm thử',
  'sidebar.development.9': 'Gỡ lỗi',
  'sidebar.development.10': 'Bảo trì',
  'sidebar.development.basic': 'Cơ bản',
  'sidebar.development.advanced': 'Nâng cao',
} satisfies MenuText<typeof developmentSidebar>
