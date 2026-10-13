import type { MenuNode } from '../../i18n/types'

export const configurationNav = {
  key: 'nav.demo.configuration',
  items: [
    { key: 'nav.demo.configuration.basic', items: [
      { key: 'nav.demo.configuration.1', link: { path: '/configuration/page-01' } },
      { key: 'nav.demo.configuration.2', link: { path: '/configuration/page-02' } },
      { key: 'nav.demo.configuration.3', link: { path: '/configuration/page-03' } },
    ] },
    { key: 'nav.demo.configuration.advanced', items: [
      { key: 'nav.demo.configuration.4', link: { path: '/configuration/page-04' } },
      { key: 'nav.demo.configuration.5', link: { path: '/configuration/page-05' } },
    ] },
  ],
} as const satisfies MenuNode
