import type { MenuText } from '../../../../i18n/types'
import type { deploymentNav } from '../../../../nav/demo/deployment'

export const deployment = {
  'nav.demo.deployment': 'Deployment',
  'nav.demo.deployment.1': 'Build',
  'nav.demo.deployment.2': 'Output',
  'nav.demo.deployment.3': 'Pages',
  'nav.demo.deployment.4': 'Vercel',
  'nav.demo.deployment.5': 'Cloudflare',
} satisfies MenuText<readonly [typeof deploymentNav]>
