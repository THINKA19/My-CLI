import type { MenuNode } from '../../i18n/types'

export const integrationsSidebar = [
  {
    key: 'sidebar.demo.integrations',
    collapsed: false,
    items: [
      {
        key: 'sidebar.demo.integrations.basic',
        collapsed: false,
        items: [
          { key: 'sidebar.demo.integrations.1', link: { path: '/integrations/page-01' } },
          { key: 'sidebar.demo.integrations.2', link: { path: '/integrations/page-02' } },
          { key: 'sidebar.demo.integrations.3', link: { path: '/integrations/page-03' } },
          { key: 'sidebar.demo.integrations.4', link: { path: '/integrations/page-04' } },
          { key: 'sidebar.demo.integrations.5', link: { path: '/integrations/page-05' } },
        ],
      },
      {
        key: 'sidebar.demo.integrations.advanced',
        collapsed: true,
        items: [
          { key: 'sidebar.demo.integrations.6', link: { path: '/integrations/page-06' } },
          { key: 'sidebar.demo.integrations.7', link: { path: '/integrations/page-07' } },
          { key: 'sidebar.demo.integrations.8', link: { path: '/integrations/page-08' } },
          { key: 'sidebar.demo.integrations.9', link: { path: '/integrations/page-09' } },
          { key: 'sidebar.demo.integrations.10', link: { path: '/integrations/page-10' } },
        ],
      },
    ],
  },
] as const satisfies readonly MenuNode[]
