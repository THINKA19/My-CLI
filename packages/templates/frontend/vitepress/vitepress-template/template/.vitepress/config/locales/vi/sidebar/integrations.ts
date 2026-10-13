import type { MenuText } from '#config/i18n/types'
import type { integrationsSidebar } from '#config/sidebar/integrations'

export const integrations = {
  'sidebar.integrations': 'Tích hợp',
  'sidebar.integrations.1': 'Plugin',
  'sidebar.integrations.2': 'Công cụ tìm kiếm',
  'sidebar.integrations.3': 'Thống kê',
  'sidebar.integrations.4': 'Lưu trữ tài nguyên',
  'sidebar.integrations.5': 'Ví dụ mã',
  'sidebar.integrations.6': 'Giao tiếp',
  'sidebar.integrations.7': 'Thông báo',
  'sidebar.integrations.8': 'Liên kết ngoài',
  'sidebar.integrations.9': 'Quyền',
  'sidebar.integrations.10': 'Mở rộng',
  'sidebar.integrations.basic': 'Cơ bản',
  'sidebar.integrations.advanced': 'Nâng cao',
} satisfies MenuText<typeof integrationsSidebar>
