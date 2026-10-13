import type { MenuText } from '#config/i18n/types'
import type { integrationsNav } from '#config/nav/integrations'

export const integrations = {
  'nav.integrations': 'Tích hợp',
  'nav.integrations.1': 'Plugin',
  'nav.integrations.2': 'Công cụ tìm kiếm',
  'nav.integrations.3': 'Thống kê',
  'nav.integrations.4': 'Lưu trữ tài nguyên',
  'nav.integrations.external': 'Tài liệu chính thức',
} satisfies MenuText<readonly [typeof integrationsNav]>
