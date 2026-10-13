import type { MenuText } from '#config/i18n/types'
import type { integrationsSidebar } from '#config/sidebar/integrations'

export const integrations = {
  'sidebar.integrations': '集成',
  'sidebar.integrations.1': '插件',
  'sidebar.integrations.2': '搜索引擎',
  'sidebar.integrations.3': '统计',
  'sidebar.integrations.4': '资源服务',
  'sidebar.integrations.5': '代码示例',
  'sidebar.integrations.6': '接口',
  'sidebar.integrations.7': '通知',
  'sidebar.integrations.8': '外部链接',
  'sidebar.integrations.9': '权限',
  'sidebar.integrations.10': '扩展',
  'sidebar.integrations.basic': '基础',
  'sidebar.integrations.advanced': '进阶',
} satisfies MenuText<typeof integrationsSidebar>
