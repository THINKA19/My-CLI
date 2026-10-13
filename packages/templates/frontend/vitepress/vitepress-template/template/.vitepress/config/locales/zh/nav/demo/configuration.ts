import type { MenuText } from '../../../../i18n/types'
import type { configurationNav } from '../../../../nav/demo/configuration'

export const configuration = {
  'nav.demo.configuration': '配置',
  'nav.demo.configuration.1': '站点',
  'nav.demo.configuration.2': '主题',
  'nav.demo.configuration.3': '语言',
  'nav.demo.configuration.4': '导航',
  'nav.demo.configuration.5': '侧边栏',
  'nav.demo.configuration.basic': '基础',
  'nav.demo.configuration.advanced': '进阶',
} satisfies MenuText<readonly [typeof configurationNav]>
