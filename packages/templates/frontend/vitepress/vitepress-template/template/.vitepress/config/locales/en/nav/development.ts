import type { MenuText } from '#config/i18n/types'
import type { developmentNav } from '#config/nav/development'

export const development = {
  'nav.development': 'Development',
  'nav.development.1': 'Markdown',
  'nav.development.2': 'Components',
  'nav.development.3': 'Layout',
  'nav.development.4': 'Styles',
  'nav.development.5': 'Diagrams',
} satisfies MenuText<readonly [typeof developmentNav]>
