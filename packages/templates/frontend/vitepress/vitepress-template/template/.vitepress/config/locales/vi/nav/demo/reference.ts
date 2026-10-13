import type { MenuText } from '../../../../i18n/types'
import type { referenceNav } from '../../../../nav/demo/reference'

export const reference = {
  'nav.demo.reference': 'Tham khảo',
  'nav.demo.reference.1': 'Quy ước',
  'nav.demo.reference.2': 'Trường',
  'nav.demo.reference.3': 'Kiểu',
  'nav.demo.reference.4': 'Quy tắc liên kết',
  'nav.demo.reference.email': 'Email liên hệ',
} satisfies MenuText<readonly [typeof referenceNav]>
