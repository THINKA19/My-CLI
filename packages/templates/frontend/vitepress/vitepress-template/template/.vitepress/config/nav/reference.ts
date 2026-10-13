import type { MenuNode } from '#config/i18n/types'

export const referenceNav = {
  key: 'nav.reference',
  items: [
    { key: 'nav.reference.1', link: { path: '/reference/page-01' } },
    { key: 'nav.reference.2', link: { path: '/reference/page-02' } },
    { key: 'nav.reference.3', link: { path: '/reference/page-03' } },
    { key: 'nav.reference.4', link: { path: '/reference/page-04' } },
    { key: 'nav.reference.email', link: { url: 'mailto:docs@example.com' } },
  ],
} as const satisfies MenuNode
