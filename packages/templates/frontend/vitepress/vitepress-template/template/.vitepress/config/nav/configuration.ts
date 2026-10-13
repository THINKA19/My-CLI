import type { MenuNode } from '#config/i18n/types'

export const configurationNav = {
  key: 'nav.configuration',
  items: [
    { key: 'nav.configuration.basic', items: [
      { key: 'nav.configuration.1', link: { path: '/configuration/page-01' } },
      { key: 'nav.configuration.2', link: { path: '/configuration/page-02' } },
      { key: 'nav.configuration.3', link: { path: '/configuration/page-03' } },
    ] },
    { key: 'nav.configuration.advanced', items: [
      { key: 'nav.configuration.4', link: { path: '/configuration/page-04' } },
      { key: 'nav.configuration.5', link: { path: '/configuration/page-05' } },
    ] },
  ],
} as const satisfies MenuNode
