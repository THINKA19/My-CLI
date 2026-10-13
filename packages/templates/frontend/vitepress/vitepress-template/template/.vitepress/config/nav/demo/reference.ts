import type { MenuNode } from '../../i18n/types'

export const referenceNav = {
  key: 'nav.demo.reference',
  items: [
    { key: 'nav.demo.reference.1', link: { path: '/reference/page-01' } },
    { key: 'nav.demo.reference.2', link: { path: '/reference/page-02' } },
    { key: 'nav.demo.reference.3', link: { path: '/reference/page-03' } },
    { key: 'nav.demo.reference.4', link: { path: '/reference/page-04' } },
    { key: 'nav.demo.reference.email', link: { url: 'mailto:docs@example.com' } },
  ],
} as const satisfies MenuNode
