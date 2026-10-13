import type { MenuText } from '../../../../i18n/types'
import type { configurationNav } from '../../../../nav/demo/configuration'

export const configuration = {
  'nav.demo.configuration': 'Configuration',
  'nav.demo.configuration.1': 'Site',
  'nav.demo.configuration.2': 'Theme',
  'nav.demo.configuration.3': 'Languages',
  'nav.demo.configuration.4': 'Navigation',
  'nav.demo.configuration.5': 'Sidebar',
  'nav.demo.configuration.basic': 'Basics',
  'nav.demo.configuration.advanced': 'Advanced',
} satisfies MenuText<readonly [typeof configurationNav]>
