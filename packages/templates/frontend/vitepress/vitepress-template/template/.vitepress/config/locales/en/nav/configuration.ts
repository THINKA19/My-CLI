import type { MenuText } from '#config/i18n/types'
import type { configurationNav } from '#config/nav/configuration'

export const configuration = {
  'nav.configuration': 'Configuration',
  'nav.configuration.1': 'Site',
  'nav.configuration.2': 'Theme',
  'nav.configuration.3': 'Languages',
  'nav.configuration.4': 'Navigation',
  'nav.configuration.5': 'Sidebar',
  'nav.configuration.basic': 'Basics',
  'nav.configuration.advanced': 'Advanced',
} satisfies MenuText<readonly [typeof configurationNav]>
