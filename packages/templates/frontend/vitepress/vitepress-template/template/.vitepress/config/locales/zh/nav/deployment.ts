import type { MenuText } from '#config/i18n/types'
import type { deploymentNav } from '#config/nav/deployment'

export const deployment = {
  'nav.deployment': '部署',
  'nav.deployment.1': '构建',
  'nav.deployment.2': '产物',
  'nav.deployment.3': 'Pages',
  'nav.deployment.4': 'Vercel',
  'nav.deployment.5': 'Cloudflare',
} satisfies MenuText<readonly [typeof deploymentNav]>
