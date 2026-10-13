import type { MenuText } from '../../../i18n/types'
import type { navStructure } from '../../../nav'
import { mergeText } from '../../../i18n/resolve'
import { demo } from './demo'

export const nav = mergeText({
  'nav.home': 'Home',
}, demo) satisfies MenuText<typeof navStructure>
