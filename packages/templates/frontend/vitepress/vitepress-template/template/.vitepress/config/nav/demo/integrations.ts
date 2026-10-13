import type { MenuNode } from '../../i18n/types'

export const integrationsNav = {
  key: 'nav.demo.integrations',
  items: [
    { key: 'nav.demo.integrations.1', link: { path: '/integrations/page-01' } },
    { key: 'nav.demo.integrations.2', link: { path: '/integrations/page-02' } },
    { key: 'nav.demo.integrations.3', link: { path: '/integrations/page-03' } },
    { key: 'nav.demo.integrations.4', link: { path: '/integrations/page-04' } },
    { key: 'nav.demo.integrations.external', link: { url: 'https://vitepress.dev/guide/i18n' } },
  ],
} as const satisfies MenuNode
