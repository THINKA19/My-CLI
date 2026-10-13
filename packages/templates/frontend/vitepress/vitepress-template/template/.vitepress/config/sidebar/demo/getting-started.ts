import type { MenuNode } from '../../i18n/types'

export const gettingStartedSidebar = [
  {
    key: 'sidebar.demo.getting-started',
    collapsed: false,
    items: [
      { key: 'sidebar.demo.getting-started.1', link: { path: '/getting-started/page-01' } },
      { key: 'sidebar.demo.getting-started.2', link: { path: '/getting-started/page-02' } },
      { key: 'sidebar.demo.getting-started.3', link: { path: '/getting-started/page-03' } },
      { key: 'sidebar.demo.getting-started.4', link: { path: '/getting-started/page-04' } },
      { key: 'sidebar.demo.getting-started.5', link: { path: '/getting-started/page-05' } },
      { key: 'sidebar.demo.getting-started.6', link: { path: '/getting-started/page-06' } },
      { key: 'sidebar.demo.getting-started.7', link: { path: '/getting-started/page-07' } },
      { key: 'sidebar.demo.getting-started.8', link: { path: '/getting-started/page-08' } },
      { key: 'sidebar.demo.getting-started.9', link: { path: '/getting-started/page-09' } },
      { key: 'sidebar.demo.getting-started.10', link: { path: '/getting-started/page-10' } },
    ],
  },
] as const satisfies readonly MenuNode[]
