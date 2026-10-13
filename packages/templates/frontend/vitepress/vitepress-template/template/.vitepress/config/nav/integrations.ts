import type { MenuNode } from '#config/i18n/types'

export const integrationsNav = {
  key: 'nav.integrations',
  items: [
    { key: 'nav.integrations.1', link: { path: '/integrations/page-01' } },
    { key: 'nav.integrations.2', link: { path: '/integrations/page-02' } },
    { key: 'nav.integrations.3', link: { path: '/integrations/page-03' } },
    { key: 'nav.integrations.4', link: { path: '/integrations/page-04' } },
    { key: 'nav.integrations.external', link: { url: 'https://vitepress.dev/guide/i18n' } },
  ],
} as const satisfies MenuNode
