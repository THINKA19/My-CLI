import type { MenuNode } from '#config/i18n/types'

export const deploymentNav = {
  key: 'nav.deployment',
  items: [
    { key: 'nav.deployment.1', link: { path: '/deployment/page-01?view=full' } },
    { key: 'nav.deployment.2', link: { path: '/deployment/page-02' } },
    { key: 'nav.deployment.3', link: { path: '/deployment/page-03' } },
    { key: 'nav.deployment.4', link: { path: '/deployment/page-04' } },
    { key: 'nav.deployment.5', link: { path: '/deployment/page-05' } },
  ],
} as const satisfies MenuNode
