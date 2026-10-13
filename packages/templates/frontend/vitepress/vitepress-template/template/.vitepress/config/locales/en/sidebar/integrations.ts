import type { MenuText } from '#config/i18n/types'
import type { integrationsSidebar } from '#config/sidebar/integrations'

export const integrations = {
  'sidebar.integrations': 'Integrations',
  'sidebar.integrations.1': 'Plugins',
  'sidebar.integrations.2': 'Search engine',
  'sidebar.integrations.3': 'Analytics',
  'sidebar.integrations.4': 'Asset hosting',
  'sidebar.integrations.5': 'Code examples',
  'sidebar.integrations.6': 'Interfaces',
  'sidebar.integrations.7': 'Notifications',
  'sidebar.integrations.8': 'External links',
  'sidebar.integrations.9': 'Permissions',
  'sidebar.integrations.10': 'Extensions',
  'sidebar.integrations.basic': 'Basics',
  'sidebar.integrations.advanced': 'Advanced',
} satisfies MenuText<typeof integrationsSidebar>
