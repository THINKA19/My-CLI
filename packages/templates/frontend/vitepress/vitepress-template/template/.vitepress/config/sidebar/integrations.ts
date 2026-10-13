import type { MenuNode } from '#config/i18n/types'

export const integrationsSidebar = [
  {
    key: 'sidebar.integrations',
    collapsed: false,
    items: [
      {
        key: 'sidebar.integrations.basic',
        collapsed: false,
        items: [
          { key: 'sidebar.integrations.1', link: { path: '/integrations/page-01' } },
          { key: 'sidebar.integrations.2', link: { path: '/integrations/page-02' } },
          { key: 'sidebar.integrations.3', link: { path: '/integrations/page-03' } },
          { key: 'sidebar.integrations.4', link: { path: '/integrations/page-04' } },
          { key: 'sidebar.integrations.5', link: { path: '/integrations/page-05' } },
        ],
      },
      {
        key: 'sidebar.integrations.advanced',
        collapsed: true,
        items: [
          { key: 'sidebar.integrations.6', link: { path: '/integrations/page-06' } },
          { key: 'sidebar.integrations.7', link: { path: '/integrations/page-07' } },
          { key: 'sidebar.integrations.8', link: { path: '/integrations/page-08' } },
          { key: 'sidebar.integrations.9', link: { path: '/integrations/page-09' } },
          { key: 'sidebar.integrations.10', link: { path: '/integrations/page-10' } },
        ],
      },
    ],
  },
] as const satisfies readonly MenuNode[]
