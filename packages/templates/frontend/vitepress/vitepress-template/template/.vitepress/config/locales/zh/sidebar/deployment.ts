import type { MenuText } from '#config/i18n/types'
import type { deploymentSidebar } from '#config/sidebar/deployment'

export const deployment = {
  'sidebar.deployment': '部署',
  'sidebar.deployment.1': '构建',
  'sidebar.deployment.2': '产物',
  'sidebar.deployment.3': 'Pages',
  'sidebar.deployment.4': 'Vercel',
  'sidebar.deployment.5': 'Cloudflare',
  'sidebar.deployment.6': 'Docker',
  'sidebar.deployment.7': 'OSS',
  'sidebar.deployment.8': 'COS',
  'sidebar.deployment.9': '回退',
  'sidebar.deployment.10': '验证',
  'sidebar.deployment.basic': '基础',
  'sidebar.deployment.advanced': '进阶',
} satisfies MenuText<typeof deploymentSidebar>
