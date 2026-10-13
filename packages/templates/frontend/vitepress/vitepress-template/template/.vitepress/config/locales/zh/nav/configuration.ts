import type { MenuText } from '#config/i18n/types'
import type { configurationNav } from '#config/nav/configuration'

export const configuration = {
  'nav.configuration': '配置',
  'nav.configuration.1': '站点',
  'nav.configuration.2': '主题',
  'nav.configuration.3': '语言',
  'nav.configuration.4': '导航',
  'nav.configuration.5': '侧边栏',
  'nav.configuration.basic': '基础',
  'nav.configuration.advanced': '进阶',
} satisfies MenuText<readonly [typeof configurationNav]>
