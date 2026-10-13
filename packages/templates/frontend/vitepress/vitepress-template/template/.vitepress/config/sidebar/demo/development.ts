import type { MenuNode } from '../../i18n/types'

export const developmentSidebar = [
  {
    key: 'sidebar.demo.development',
    collapsed: false,
    items: [
      {
        key: 'sidebar.demo.development.basic',
        collapsed: false,
        items: [
          { key: 'sidebar.demo.development.1', link: { path: '/development/page-01' } },
          { key: 'sidebar.demo.development.2', link: { path: '/development/page-02' } },
          { key: 'sidebar.demo.development.3', link: { path: '/development/page-03' } },
          { key: 'sidebar.demo.development.4', link: { path: '/development/page-04' } },
          { key: 'sidebar.demo.development.5', link: { path: '/development/page-05' } },
        ],
      },
      {
        key: 'sidebar.demo.development.advanced',
        collapsed: true,
        items: [
          { key: 'sidebar.demo.development.6', link: { path: '/development/page-06' } },
          { key: 'sidebar.demo.development.7', link: { path: '/development/page-07' } },
          { key: 'sidebar.demo.development.8', link: { path: '/development/page-08' } },
          { key: 'sidebar.demo.development.9', link: { path: '/development/page-09' } },
          { key: 'sidebar.demo.development.10', link: { path: '/development/page-10' } },
        ],
      },
    ],
  },
] as const satisfies readonly MenuNode[]
