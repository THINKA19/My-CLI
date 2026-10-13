import type { MenuNode } from '../../i18n/types'

export const developmentNav = {
  key: 'nav.demo.development',
  items: [
    { key: 'nav.demo.development.1', link: { path: '/development/page-01#details' } },
    { key: 'nav.demo.development.2', link: { path: '/development/page-02' } },
    { key: 'nav.demo.development.3', link: { path: '/development/page-03' } },
    { key: 'nav.demo.development.4', link: { path: '/development/page-04' } },
    { key: 'nav.demo.development.5', link: { path: '/development/page-05' } },
  ],
} as const satisfies MenuNode
