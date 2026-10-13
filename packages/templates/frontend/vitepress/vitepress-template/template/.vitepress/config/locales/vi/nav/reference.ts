import type { MenuText } from '#config/i18n/types'
import type { referenceNav } from '#config/nav/reference'

export const reference = {
  'nav.reference': 'Tham khảo',
  'nav.reference.1': 'Quy ước',
  'nav.reference.2': 'Trường',
  'nav.reference.3': 'Kiểu',
  'nav.reference.4': 'Quy tắc liên kết',
  'nav.reference.email': 'Email liên hệ',
} satisfies MenuText<readonly [typeof referenceNav]>
