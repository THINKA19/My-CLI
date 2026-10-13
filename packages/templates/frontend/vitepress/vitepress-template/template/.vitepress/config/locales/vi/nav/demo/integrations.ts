import type { MenuText } from '../../../../i18n/types'
import type { integrationsNav } from '../../../../nav/demo/integrations'

export const integrations = {
  'nav.demo.integrations': 'Tích hợp',
  'nav.demo.integrations.1': 'Plugin',
  'nav.demo.integrations.2': 'Công cụ tìm kiếm',
  'nav.demo.integrations.3': 'Thống kê',
  'nav.demo.integrations.4': 'Lưu trữ tài nguyên',
  'nav.demo.integrations.external': 'Tài liệu chính thức',
} satisfies MenuText<readonly [typeof integrationsNav]>
