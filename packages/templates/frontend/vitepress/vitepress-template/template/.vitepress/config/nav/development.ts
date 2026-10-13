import type { MenuNode } from '#config/i18n/types'

export const developmentNav = {
  key: 'nav.development',
  items: [
    { key: 'nav.development.1', link: { path: '/development/page-01#details' } },
    { key: 'nav.development.2', link: { path: '/development/page-02' } },
    { key: 'nav.development.3', link: { path: '/development/page-03' } },
    { key: 'nav.development.4', link: { path: '/development/page-04' } },
    { key: 'nav.development.5', link: { path: '/development/page-05' } },
  ],
} as const satisfies MenuNode
