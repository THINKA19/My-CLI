import type { MenuText } from '../../../i18n/types'
import type { sidebarSections } from '../../../sidebar'
import { mergeText } from '../../../i18n/resolve'
import { demo } from './demo'

export const sidebar = mergeText(demo) satisfies MenuText<(typeof sidebarSections)[number]['items']>
