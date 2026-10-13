import type { MenuText } from '../../../../i18n/types'
import type { integrationsNav } from '../../../../nav/demo/integrations'

export const integrations = {
  'nav.demo.integrations': '集成',
  'nav.demo.integrations.1': '插件',
  'nav.demo.integrations.2': '搜索引擎',
  'nav.demo.integrations.3': '统计',
  'nav.demo.integrations.4': '资源服务',
  'nav.demo.integrations.external': '官方文档',
} satisfies MenuText<readonly [typeof integrationsNav]>
