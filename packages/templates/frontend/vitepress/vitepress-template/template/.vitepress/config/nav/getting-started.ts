import type { MenuNode } from '#config/i18n/types'

export const gettingStartedNav = {
  key: 'nav.getting-started',
  items: [
    { key: 'nav.getting-started.1', link: { path: '/getting-started/page-01' } },
    { key: 'nav.getting-started.2', link: { path: '/getting-started/page-02' } },
    { key: 'nav.getting-started.3', link: { path: '/getting-started/page-03' } },
    { key: 'nav.getting-started.4', link: { path: '/getting-started/page-04' } },
    { key: 'nav.getting-started.5', link: { path: '/getting-started/page-05' } },
  ],
} as const satisfies MenuNode
