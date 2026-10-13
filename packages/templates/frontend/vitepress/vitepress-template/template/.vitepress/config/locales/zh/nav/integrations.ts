import type { MenuText } from '#config/i18n/types'
import type { integrationsNav } from '#config/nav/integrations'

export const integrations = {
  'nav.integrations': '集成',
  'nav.integrations.1': '插件',
  'nav.integrations.2': '搜索引擎',
  'nav.integrations.3': '统计',
  'nav.integrations.4': '资源服务',
  'nav.integrations.external': '官方文档',
} satisfies MenuText<readonly [typeof integrationsNav]>
