import type { MenuText } from '#config/i18n/types'
import type { deploymentNav } from '#config/nav/deployment'

export const deployment = {
  'nav.deployment': 'Deployment',
  'nav.deployment.1': 'Build',
  'nav.deployment.2': 'Output',
  'nav.deployment.3': 'Pages',
  'nav.deployment.4': 'Vercel',
  'nav.deployment.5': 'Cloudflare',
} satisfies MenuText<readonly [typeof deploymentNav]>
