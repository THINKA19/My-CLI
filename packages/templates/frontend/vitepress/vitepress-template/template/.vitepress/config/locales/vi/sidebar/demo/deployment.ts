import type { MenuText } from '../../../../i18n/types'
import type { deploymentSidebar } from '../../../../sidebar/demo/deployment'

export const deployment = {
  'sidebar.demo.deployment': 'Triển khai',
  'sidebar.demo.deployment.1': 'Bản dựng',
  'sidebar.demo.deployment.2': 'Đầu ra',
  'sidebar.demo.deployment.3': 'Pages',
  'sidebar.demo.deployment.4': 'Vercel',
  'sidebar.demo.deployment.5': 'Cloudflare',
  'sidebar.demo.deployment.6': 'Docker',
  'sidebar.demo.deployment.7': 'OSS',
  'sidebar.demo.deployment.8': 'COS',
  'sidebar.demo.deployment.9': 'Khôi phục',
  'sidebar.demo.deployment.10': 'Xác minh',
  'sidebar.demo.deployment.basic': 'Cơ bản',
  'sidebar.demo.deployment.advanced': 'Nâng cao',
} satisfies MenuText<typeof deploymentSidebar>
