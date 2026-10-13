import type { MenuText } from '#config/i18n/types'
import type { developmentSidebar } from '#config/sidebar/development'

export const development = {
  'sidebar.development': 'Development',
  'sidebar.development.1': 'Markdown',
  'sidebar.development.2': 'Components',
  'sidebar.development.3': 'Layout',
  'sidebar.development.4': 'Styles',
  'sidebar.development.5': 'Diagrams',
  'sidebar.development.6': 'Data',
  'sidebar.development.7': 'Types',
  'sidebar.development.8': 'Tests',
  'sidebar.development.9': 'Debugging',
  'sidebar.development.10': 'Maintenance',
  'sidebar.development.basic': 'Basics',
  'sidebar.development.advanced': 'Advanced',
} satisfies MenuText<typeof developmentSidebar>
