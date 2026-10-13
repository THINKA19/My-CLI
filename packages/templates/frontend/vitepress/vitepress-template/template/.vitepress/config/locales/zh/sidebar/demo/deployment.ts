import type { MenuText } from '../../../../i18n/types'
import type { deploymentSidebar } from '../../../../sidebar/demo/deployment'

export const deployment = {
  'sidebar.demo.deployment': '部署',
  'sidebar.demo.deployment.1': '构建',
  'sidebar.demo.deployment.2': '产物',
  'sidebar.demo.deployment.3': 'Pages',
  'sidebar.demo.deployment.4': 'Vercel',
  'sidebar.demo.deployment.5': 'Cloudflare',
  'sidebar.demo.deployment.6': 'Docker',
  'sidebar.demo.deployment.7': 'OSS',
  'sidebar.demo.deployment.8': 'COS',
  'sidebar.demo.deployment.9': '回退',
  'sidebar.demo.deployment.10': '验证',
  'sidebar.demo.deployment.basic': '基础',
  'sidebar.demo.deployment.advanced': '进阶',
} satisfies MenuText<typeof deploymentSidebar>
