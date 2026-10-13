import type { MenuText } from '../../../../i18n/types'
import type { referenceNav } from '../../../../nav/demo/reference'

export const reference = {
  'nav.demo.reference': '参考',
  'nav.demo.reference.1': '约定',
  'nav.demo.reference.2': '字段',
  'nav.demo.reference.3': '类型',
  'nav.demo.reference.4': '链接规则',
  'nav.demo.reference.email': '联系邮箱',
} satisfies MenuText<readonly [typeof referenceNav]>
