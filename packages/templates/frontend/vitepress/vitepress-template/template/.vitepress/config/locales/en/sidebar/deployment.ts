import type { MenuText } from '#config/i18n/types'
import type { deploymentSidebar } from '#config/sidebar/deployment'

export const deployment = {
  'sidebar.deployment': 'Deployment',
  'sidebar.deployment.1': 'Build',
  'sidebar.deployment.2': 'Output',
  'sidebar.deployment.3': 'Pages',
  'sidebar.deployment.4': 'Vercel',
  'sidebar.deployment.5': 'Cloudflare',
  'sidebar.deployment.6': 'Docker',
  'sidebar.deployment.7': 'OSS',
  'sidebar.deployment.8': 'COS',
  'sidebar.deployment.9': 'Rollback',
  'sidebar.deployment.10': 'Verification',
  'sidebar.deployment.basic': 'Basics',
  'sidebar.deployment.advanced': 'Advanced',
} satisfies MenuText<typeof deploymentSidebar>
