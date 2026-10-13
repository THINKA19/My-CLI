import type { MenuNode } from '../../i18n/types'

export const deploymentSidebar = [
  {
    key: 'sidebar.demo.deployment',
    collapsed: false,
    items: [
      {
        key: 'sidebar.demo.deployment.basic',
        collapsed: false,
        items: [
          { key: 'sidebar.demo.deployment.1', link: { path: '/deployment/page-01' } },
          { key: 'sidebar.demo.deployment.2', link: { path: '/deployment/page-02' } },
          { key: 'sidebar.demo.deployment.3', link: { path: '/deployment/page-03' } },
          { key: 'sidebar.demo.deployment.4', link: { path: '/deployment/page-04' } },
          { key: 'sidebar.demo.deployment.5', link: { path: '/deployment/page-05' } },
        ],
      },
      {
        key: 'sidebar.demo.deployment.advanced',
        collapsed: true,
        items: [
          { key: 'sidebar.demo.deployment.6', link: { path: '/deployment/page-06' } },
          { key: 'sidebar.demo.deployment.7', link: { path: '/deployment/page-07' } },
          { key: 'sidebar.demo.deployment.8', link: { path: '/deployment/page-08' } },
          { key: 'sidebar.demo.deployment.9', link: { path: '/deployment/page-09' } },
          { key: 'sidebar.demo.deployment.10', link: { path: '/deployment/page-10' } },
        ],
      },
    ],
  },
] as const satisfies readonly MenuNode[]
