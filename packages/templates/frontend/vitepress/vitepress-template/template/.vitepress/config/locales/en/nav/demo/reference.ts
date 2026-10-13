import type { MenuText } from '../../../../i18n/types'
import type { referenceNav } from '../../../../nav/demo/reference'

export const reference = {
  'nav.demo.reference': 'Reference',
  'nav.demo.reference.1': 'Conventions',
  'nav.demo.reference.2': 'Fields',
  'nav.demo.reference.3': 'Types',
  'nav.demo.reference.4': 'Link rules',
  'nav.demo.reference.email': 'Contact email',
} satisfies MenuText<readonly [typeof referenceNav]>
