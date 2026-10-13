import type { MenuText } from '#config/i18n/types'
import type { referenceNav } from '#config/nav/reference'

export const reference = {
  'nav.reference': 'Reference',
  'nav.reference.1': 'Conventions',
  'nav.reference.2': 'Fields',
  'nav.reference.3': 'Types',
  'nav.reference.4': 'Link rules',
  'nav.reference.email': 'Contact email',
} satisfies MenuText<readonly [typeof referenceNav]>
