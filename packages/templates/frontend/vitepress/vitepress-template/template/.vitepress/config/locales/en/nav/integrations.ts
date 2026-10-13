import type { MenuText } from '#config/i18n/types'
import type { integrationsNav } from '#config/nav/integrations'

export const integrations = {
  'nav.integrations': 'Integrations',
  'nav.integrations.1': 'Plugins',
  'nav.integrations.2': 'Search engine',
  'nav.integrations.3': 'Analytics',
  'nav.integrations.4': 'Asset hosting',
  'nav.integrations.external': 'Official docs',
} satisfies MenuText<readonly [typeof integrationsNav]>
