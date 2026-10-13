import type { MenuText } from '../../../../i18n/types'
import type { deploymentNav } from '../../../../nav/demo/deployment'

export const deployment = {
  'nav.demo.deployment': 'Triển khai',
  'nav.demo.deployment.1': 'Bản dựng',
  'nav.demo.deployment.2': 'Đầu ra',
  'nav.demo.deployment.3': 'Pages',
  'nav.demo.deployment.4': 'Vercel',
  'nav.demo.deployment.5': 'Cloudflare',
} satisfies MenuText<readonly [typeof deploymentNav]>
