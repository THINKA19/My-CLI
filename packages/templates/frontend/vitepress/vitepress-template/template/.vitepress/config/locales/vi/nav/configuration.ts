import type { MenuText } from '#config/i18n/types'
import type { configurationNav } from '#config/nav/configuration'

export const configuration = {
  'nav.configuration': 'Cấu hình',
  'nav.configuration.1': 'Trang web',
  'nav.configuration.2': 'Giao diện',
  'nav.configuration.3': 'Ngôn ngữ',
  'nav.configuration.4': 'Điều hướng',
  'nav.configuration.5': 'Thanh bên',
  'nav.configuration.basic': 'Cơ bản',
  'nav.configuration.advanced': 'Nâng cao',
} satisfies MenuText<readonly [typeof configurationNav]>
