import type { MenuText } from '../../../../i18n/types'
import type { configurationSidebar } from '../../../../sidebar/demo/configuration'

export const configuration = {
  'sidebar.demo.configuration': '配置',
  'sidebar.demo.configuration.1': '站点',
  'sidebar.demo.configuration.2': '主题',
  'sidebar.demo.configuration.3': '语言',
  'sidebar.demo.configuration.4': '导航',
  'sidebar.demo.configuration.5': '侧边栏',
  'sidebar.demo.configuration.6': '搜索',
  'sidebar.demo.configuration.7': 'SEO',
  'sidebar.demo.configuration.8': '域名',
  'sidebar.demo.configuration.9': '子路径',
  'sidebar.demo.configuration.10': '校验',
  'sidebar.demo.configuration.basic': '基础',
  'sidebar.demo.configuration.advanced': '进阶',
} satisfies MenuText<typeof configurationSidebar>
