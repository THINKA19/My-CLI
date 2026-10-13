import type { MenuText } from '#config/i18n/types'
import type { configurationSidebar } from '#config/sidebar/configuration'

export const configuration = {
  'sidebar.configuration': 'Cấu hình',
  'sidebar.configuration.1': 'Trang web',
  'sidebar.configuration.2': 'Giao diện',
  'sidebar.configuration.3': 'Ngôn ngữ',
  'sidebar.configuration.4': 'Điều hướng',
  'sidebar.configuration.5': 'Thanh bên',
  'sidebar.configuration.6': 'Tìm kiếm',
  'sidebar.configuration.7': 'SEO',
  'sidebar.configuration.8': 'Tên miền',
  'sidebar.configuration.9': 'Đường dẫn gốc',
  'sidebar.configuration.10': 'Xác thực',
  'sidebar.configuration.basic': 'Cơ bản',
  'sidebar.configuration.advanced': 'Nâng cao',
} satisfies MenuText<typeof configurationSidebar>
