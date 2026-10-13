import type { MenuText } from '#config/i18n/types'
import type { gettingStartedNav } from '#config/nav/getting-started'

export const gettingStarted = {
  'nav.getting-started': 'Getting started',
  'nav.getting-started.1': 'Installation',
  'nav.getting-started.2': 'Environment',
  'nav.getting-started.3': 'Directories',
  'nav.getting-started.4': 'Commands',
  'nav.getting-started.5': 'Configuration',
} satisfies MenuText<readonly [typeof gettingStartedNav]>
