import type { MenuNode } from '#config/i18n/types'

export const referenceSidebar = [
  {
    key: 'sidebar.reference',
    collapsed: false,
    items: [
      {
        key: 'sidebar.reference.basic',
        collapsed: false,
        items: [
          { key: 'sidebar.reference.1', link: { path: '/reference/page-01' } },
          { key: 'sidebar.reference.2', link: { path: '/reference/page-02' } },
          { key: 'sidebar.reference.3', link: { path: '/reference/page-03' } },
          { key: 'sidebar.reference.4', link: { path: '/reference/page-04' } },
          { key: 'sidebar.reference.5', link: { path: '/reference/page-05' } },
        ],
      },
      {
        key: 'sidebar.reference.advanced',
        collapsed: true,
        items: [
          { key: 'sidebar.reference.6', link: { path: '/reference/page-06' } },
          { key: 'sidebar.reference.7', link: { path: '/reference/page-07' } },
          { key: 'sidebar.reference.8', link: { path: '/reference/page-08' } },
          { key: 'sidebar.reference.9', link: { path: '/reference/page-09' } },
          { key: 'sidebar.reference.10', link: { path: '/reference/page-10' } },
        ],
      },
    ],
  },
] as const satisfies readonly MenuNode[]
