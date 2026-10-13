import type { MenuText } from '#config/i18n/types'
import type { deploymentSidebar } from '#config/sidebar/deployment'

export const deployment = {
  'sidebar.deployment': 'Triển khai',
  'sidebar.deployment.1': 'Bản dựng',
  'sidebar.deployment.2': 'Đầu ra',
  'sidebar.deployment.3': 'Pages',
  'sidebar.deployment.4': 'Vercel',
  'sidebar.deployment.5': 'Cloudflare',
  'sidebar.deployment.6': 'Docker',
  'sidebar.deployment.7': 'OSS',
  'sidebar.deployment.8': 'COS',
  'sidebar.deployment.9': 'Khôi phục',
  'sidebar.deployment.10': 'Xác minh',
  'sidebar.deployment.basic': 'Cơ bản',
  'sidebar.deployment.advanced': 'Nâng cao',
} satisfies MenuText<typeof deploymentSidebar>
