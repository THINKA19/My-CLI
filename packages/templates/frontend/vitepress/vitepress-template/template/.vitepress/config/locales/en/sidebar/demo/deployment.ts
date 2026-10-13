import type { MenuText } from '../../../../i18n/types'
import type { deploymentSidebar } from '../../../../sidebar/demo/deployment'

export const deployment = {
  'sidebar.demo.deployment': 'Deployment',
  'sidebar.demo.deployment.1': 'Build',
  'sidebar.demo.deployment.2': 'Output',
  'sidebar.demo.deployment.3': 'Pages',
  'sidebar.demo.deployment.4': 'Vercel',
  'sidebar.demo.deployment.5': 'Cloudflare',
  'sidebar.demo.deployment.6': 'Docker',
  'sidebar.demo.deployment.7': 'OSS',
  'sidebar.demo.deployment.8': 'COS',
  'sidebar.demo.deployment.9': 'Rollback',
  'sidebar.demo.deployment.10': 'Verification',
  'sidebar.demo.deployment.basic': 'Basics',
  'sidebar.demo.deployment.advanced': 'Advanced',
} satisfies MenuText<typeof deploymentSidebar>
