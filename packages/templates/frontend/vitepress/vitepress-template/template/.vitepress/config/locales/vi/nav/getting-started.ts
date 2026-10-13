import type { MenuText } from '#config/i18n/types'
import type { gettingStartedNav } from '#config/nav/getting-started'

export const gettingStarted = {
  'nav.getting-started': 'Bắt đầu',
  'nav.getting-started.1': 'Cài đặt',
  'nav.getting-started.2': 'Môi trường',
  'nav.getting-started.3': 'Thư mục',
  'nav.getting-started.4': 'Lệnh',
  'nav.getting-started.5': 'Cấu hình',
} satisfies MenuText<readonly [typeof gettingStartedNav]>
