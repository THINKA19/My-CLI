import type { MenuNode } from '../../i18n/types'

export const configurationSidebar = [
  {
    key: 'sidebar.demo.configuration',
    collapsed: false,
    items: [
      {
        key: 'sidebar.demo.configuration.basic',
        collapsed: false,
        items: [
          { key: 'sidebar.demo.configuration.1', link: { path: '/configuration/page-01' } },
          { key: 'sidebar.demo.configuration.2', link: { path: '/configuration/page-02' } },
          { key: 'sidebar.demo.configuration.3', link: { path: '/configuration/page-03' } },
          { key: 'sidebar.demo.configuration.4', link: { path: '/configuration/page-04' } },
          { key: 'sidebar.demo.configuration.5', link: { path: '/configuration/page-05' } },
        ],
      },
      {
        key: 'sidebar.demo.configuration.advanced',
        collapsed: true,
        items: [
          { key: 'sidebar.demo.configuration.6', link: { path: '/configuration/page-06' } },
          { key: 'sidebar.demo.configuration.7', link: { path: '/configuration/page-07' } },
          { key: 'sidebar.demo.configuration.8', link: { path: '/configuration/page-08' } },
          { key: 'sidebar.demo.configuration.9', link: { path: '/configuration/page-09' } },
          { key: 'sidebar.demo.configuration.10', link: { path: '/configuration/page-10' } },
        ],
      },
    ],
  },
] as const satisfies readonly MenuNode[]
