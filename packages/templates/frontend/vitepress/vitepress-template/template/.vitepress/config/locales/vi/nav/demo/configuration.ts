import type { MenuText } from '../../../../i18n/types'
import type { configurationNav } from '../../../../nav/demo/configuration'

export const configuration = {
  'nav.demo.configuration': 'Cấu hình',
  'nav.demo.configuration.1': 'Trang web',
  'nav.demo.configuration.2': 'Giao diện',
  'nav.demo.configuration.3': 'Ngôn ngữ',
  'nav.demo.configuration.4': 'Điều hướng',
  'nav.demo.configuration.5': 'Thanh bên',
  'nav.demo.configuration.basic': 'Cơ bản',
  'nav.demo.configuration.advanced': 'Nâng cao',
} satisfies MenuText<readonly [typeof configurationNav]>
