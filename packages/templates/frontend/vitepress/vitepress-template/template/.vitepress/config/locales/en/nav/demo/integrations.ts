import type { MenuText } from '../../../../i18n/types'
import type { integrationsNav } from '../../../../nav/demo/integrations'

export const integrations = {
  'nav.demo.integrations': 'Integrations',
  'nav.demo.integrations.1': 'Plugins',
  'nav.demo.integrations.2': 'Search engine',
  'nav.demo.integrations.3': 'Analytics',
  'nav.demo.integrations.4': 'Asset hosting',
  'nav.demo.integrations.external': 'Official docs',
} satisfies MenuText<readonly [typeof integrationsNav]>
