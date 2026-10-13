import type { MenuNode } from '#config/i18n/types'

export const deploymentSidebar = [
  {
    key: 'sidebar.deployment',
    collapsed: false,
    items: [
      {
        key: 'sidebar.deployment.basic',
        collapsed: false,
        items: [
          { key: 'sidebar.deployment.1', link: { path: '/deployment/page-01' } },
          { key: 'sidebar.deployment.2', link: { path: '/deployment/page-02' } },
          { key: 'sidebar.deployment.3', link: { path: '/deployment/page-03' } },
          { key: 'sidebar.deployment.4', link: { path: '/deployment/page-04' } },
          { key: 'sidebar.deployment.5', link: { path: '/deployment/page-05' } },
        ],
      },
      {
        key: 'sidebar.deployment.advanced',
        collapsed: true,
        items: [
          { key: 'sidebar.deployment.6', link: { path: '/deployment/page-06' } },
          { key: 'sidebar.deployment.7', link: { path: '/deployment/page-07' } },
          { key: 'sidebar.deployment.8', link: { path: '/deployment/page-08' } },
          { key: 'sidebar.deployment.9', link: { path: '/deployment/page-09' } },
          { key: 'sidebar.deployment.10', link: { path: '/deployment/page-10' } },
        ],
      },
    ],
  },
] as const satisfies readonly MenuNode[]
