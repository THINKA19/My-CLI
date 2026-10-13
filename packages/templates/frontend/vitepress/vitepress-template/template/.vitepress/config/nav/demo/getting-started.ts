import type { MenuNode } from '../../i18n/types'

export const gettingStartedNav = {
  key: 'nav.demo.getting-started',
  items: [
    { key: 'nav.demo.getting-started.1', link: { path: '/getting-started/page-01' } },
    { key: 'nav.demo.getting-started.2', link: { path: '/getting-started/page-02' } },
    { key: 'nav.demo.getting-started.3', link: { path: '/getting-started/page-03' } },
    { key: 'nav.demo.getting-started.4', link: { path: '/getting-started/page-04' } },
    { key: 'nav.demo.getting-started.5', link: { path: '/getting-started/page-05' } },
  ],
} as const satisfies MenuNode
