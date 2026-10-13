import type { MenuNode } from '../i18n/types'
import { demoNav } from './demo'

export const navStructure = [
  { key: 'nav.home', link: { path: '/' } },
  ...demoNav,
] as const satisfies readonly MenuNode[]
