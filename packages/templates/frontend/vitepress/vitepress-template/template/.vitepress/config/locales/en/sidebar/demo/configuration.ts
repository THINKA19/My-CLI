import type { MenuText } from '../../../../i18n/types'
import type { configurationSidebar } from '../../../../sidebar/demo/configuration'

export const configuration = {
  'sidebar.demo.configuration': 'Configuration',
  'sidebar.demo.configuration.1': 'Site',
  'sidebar.demo.configuration.2': 'Theme',
  'sidebar.demo.configuration.3': 'Languages',
  'sidebar.demo.configuration.4': 'Navigation',
  'sidebar.demo.configuration.5': 'Sidebar',
  'sidebar.demo.configuration.6': 'Search',
  'sidebar.demo.configuration.7': 'SEO',
  'sidebar.demo.configuration.8': 'Domain',
  'sidebar.demo.configuration.9': 'Base path',
  'sidebar.demo.configuration.10': 'Validation',
  'sidebar.demo.configuration.basic': 'Basics',
  'sidebar.demo.configuration.advanced': 'Advanced',
} satisfies MenuText<typeof configurationSidebar>
