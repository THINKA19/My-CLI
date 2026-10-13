import type { MenuText } from '#config/i18n/types'
import type { referenceNav } from '#config/nav/reference'

export const reference = {
  'nav.reference': '参考',
  'nav.reference.1': '约定',
  'nav.reference.2': '字段',
  'nav.reference.3': '类型',
  'nav.reference.4': '链接规则',
  'nav.reference.email': '联系邮箱',
} satisfies MenuText<readonly [typeof referenceNav]>
