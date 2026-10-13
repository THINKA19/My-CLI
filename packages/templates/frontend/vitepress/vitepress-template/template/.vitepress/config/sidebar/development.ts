import type { MenuNode } from '#config/i18n/types'

export const developmentSidebar = [
  {
    key: 'sidebar.development',
    collapsed: false,
    items: [
      {
        key: 'sidebar.development.basic',
        collapsed: false,
        items: [
          { key: 'sidebar.development.1', link: { path: '/development/page-01' } },
          { key: 'sidebar.development.2', link: { path: '/development/page-02' } },
          { key: 'sidebar.development.3', link: { path: '/development/page-03' } },
          { key: 'sidebar.development.4', link: { path: '/development/page-04' } },
          { key: 'sidebar.development.5', link: { path: '/development/page-05' } },
        ],
      },
      {
        key: 'sidebar.development.advanced',
        collapsed: true,
        items: [
          { key: 'sidebar.development.6', link: { path: '/development/page-06' } },
          { key: 'sidebar.development.7', link: { path: '/development/page-07' } },
          { key: 'sidebar.development.8', link: { path: '/development/page-08' } },
          { key: 'sidebar.development.9', link: { path: '/development/page-09' } },
          { key: 'sidebar.development.10', link: { path: '/development/page-10' } },
        ],
      },
    ],
  },
] as const satisfies readonly MenuNode[]
