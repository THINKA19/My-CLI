import type { MenuNode } from '#config/i18n/types'

export const configurationSidebar = [
  {
    key: 'sidebar.configuration',
    collapsed: false,
    items: [
      {
        key: 'sidebar.configuration.basic',
        collapsed: false,
        items: [
          { key: 'sidebar.configuration.1', link: { path: '/configuration/page-01' } },
          { key: 'sidebar.configuration.2', link: { path: '/configuration/page-02' } },
          { key: 'sidebar.configuration.3', link: { path: '/configuration/page-03' } },
          { key: 'sidebar.configuration.4', link: { path: '/configuration/page-04' } },
          { key: 'sidebar.configuration.5', link: { path: '/configuration/page-05' } },
        ],
      },
      {
        key: 'sidebar.configuration.advanced',
        collapsed: true,
        items: [
          { key: 'sidebar.configuration.6', link: { path: '/configuration/page-06' } },
          { key: 'sidebar.configuration.7', link: { path: '/configuration/page-07' } },
          { key: 'sidebar.configuration.8', link: { path: '/configuration/page-08' } },
          { key: 'sidebar.configuration.9', link: { path: '/configuration/page-09' } },
          { key: 'sidebar.configuration.10', link: { path: '/configuration/page-10' } },
        ],
      },
    ],
  },
] as const satisfies readonly MenuNode[]
