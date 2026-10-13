import type { MenuText } from '#config/i18n/types'
import type { configurationSidebar } from '#config/sidebar/configuration'

export const configuration = {
  'sidebar.configuration': 'Configuration',
  'sidebar.configuration.1': 'Site',
  'sidebar.configuration.2': 'Theme',
  'sidebar.configuration.3': 'Languages',
  'sidebar.configuration.4': 'Navigation',
  'sidebar.configuration.5': 'Sidebar',
  'sidebar.configuration.6': 'Search',
  'sidebar.configuration.7': 'SEO',
  'sidebar.configuration.8': 'Domain',
  'sidebar.configuration.9': 'Base path',
  'sidebar.configuration.10': 'Validation',
  'sidebar.configuration.basic': 'Basics',
  'sidebar.configuration.advanced': 'Advanced',
} satisfies MenuText<typeof configurationSidebar>
