import type { MenuText } from '../../../../i18n/types'
import type { developmentNav } from '../../../../nav/demo/development'

export const development = {
  'nav.demo.development': 'Development',
  'nav.demo.development.1': 'Markdown',
  'nav.demo.development.2': 'Components',
  'nav.demo.development.3': 'Layout',
  'nav.demo.development.4': 'Styles',
  'nav.demo.development.5': 'Diagrams',
} satisfies MenuText<readonly [typeof developmentNav]>
