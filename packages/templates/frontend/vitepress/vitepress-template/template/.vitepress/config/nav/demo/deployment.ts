import type { MenuNode } from '../../i18n/types'

export const deploymentNav = {
  key: 'nav.demo.deployment',
  items: [
    { key: 'nav.demo.deployment.1', link: { path: '/deployment/page-01?view=full' } },
    { key: 'nav.demo.deployment.2', link: { path: '/deployment/page-02' } },
    { key: 'nav.demo.deployment.3', link: { path: '/deployment/page-03' } },
    { key: 'nav.demo.deployment.4', link: { path: '/deployment/page-04' } },
    { key: 'nav.demo.deployment.5', link: { path: '/deployment/page-05' } },
  ],
} as const satisfies MenuNode
