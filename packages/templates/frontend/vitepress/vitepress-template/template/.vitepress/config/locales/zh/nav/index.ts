import type { MenuText } from '../../../i18n/types'
import type { navStructure } from '../../../nav'
import { mergeText } from '../../../i18n/resolve'
import { demo } from './demo'

export const nav = mergeText({
  'nav.home': '首页',
}, demo) satisfies MenuText<typeof navStructure>
