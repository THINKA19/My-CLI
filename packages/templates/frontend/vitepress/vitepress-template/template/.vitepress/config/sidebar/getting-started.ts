import type { MenuNode } from '#config/i18n/types'

export const gettingStartedSidebar = [
  {
    key: 'sidebar.getting-started',
    collapsed: false,
    items: [
      { key: 'sidebar.getting-started.1', link: { path: '/getting-started/page-01' } },
      { key: 'sidebar.getting-started.2', link: { path: '/getting-started/page-02' } },
      { key: 'sidebar.getting-started.3', link: { path: '/getting-started/page-03' } },
      { key: 'sidebar.getting-started.4', link: { path: '/getting-started/page-04' } },
      { key: 'sidebar.getting-started.5', link: { path: '/getting-started/page-05' } },
      { key: 'sidebar.getting-started.6', link: { path: '/getting-started/page-06' } },
      { key: 'sidebar.getting-started.7', link: { path: '/getting-started/page-07' } },
      { key: 'sidebar.getting-started.8', link: { path: '/getting-started/page-08' } },
      { key: 'sidebar.getting-started.9', link: { path: '/getting-started/page-09' } },
      { key: 'sidebar.getting-started.10', link: { path: '/getting-started/page-10' } },
    ],
  },
] as const satisfies readonly MenuNode[]
