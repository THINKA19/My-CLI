import type { MenuText } from '#config/i18n/types'
import type { deploymentNav } from '#config/nav/deployment'

export const deployment = {
  'nav.deployment': 'Triển khai',
  'nav.deployment.1': 'Bản dựng',
  'nav.deployment.2': 'Đầu ra',
  'nav.deployment.3': 'Pages',
  'nav.deployment.4': 'Vercel',
  'nav.deployment.5': 'Cloudflare',
} satisfies MenuText<readonly [typeof deploymentNav]>
