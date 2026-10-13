import type { MenuNode } from '../../i18n/types'

export const referenceSidebar = [
  {
    key: 'sidebar.demo.reference',
    collapsed: false,
    items: [
      {
        key: 'sidebar.demo.reference.basic',
        collapsed: false,
        items: [
          { key: 'sidebar.demo.reference.1', link: { path: '/reference/page-01' } },
          { key: 'sidebar.demo.reference.2', link: { path: '/reference/page-02' } },
          { key: 'sidebar.demo.reference.3', link: { path: '/reference/page-03' } },
          { key: 'sidebar.demo.reference.4', link: { path: '/reference/page-04' } },
          { key: 'sidebar.demo.reference.5', link: { path: '/reference/page-05' } },
        ],
      },
      {
        key: 'sidebar.demo.reference.advanced',
        collapsed: true,
        items: [
          { key: 'sidebar.demo.reference.6', link: { path: '/reference/page-06' } },
          { key: 'sidebar.demo.reference.7', link: { path: '/reference/page-07' } },
          { key: 'sidebar.demo.reference.8', link: { path: '/reference/page-08' } },
          { key: 'sidebar.demo.reference.9', link: { path: '/reference/page-09' } },
          { key: 'sidebar.demo.reference.10', link: { path: '/reference/page-10' } },
        ],
      },
    ],
  },
] as const satisfies readonly MenuNode[]
