import type { MenuText } from '#config/i18n/types'
import type { configurationSidebar } from '#config/sidebar/configuration'

export const configuration = {
  'sidebar.configuration': '配置',
  'sidebar.configuration.1': '站点',
  'sidebar.configuration.2': '主题',
  'sidebar.configuration.3': '语言',
  'sidebar.configuration.4': '导航',
  'sidebar.configuration.5': '侧边栏',
  'sidebar.configuration.6': '搜索',
  'sidebar.configuration.7': 'SEO',
  'sidebar.configuration.8': '域名',
  'sidebar.configuration.9': '子路径',
  'sidebar.configuration.10': '校验',
  'sidebar.configuration.basic': '基础',
  'sidebar.configuration.advanced': '进阶',
} satisfies MenuText<typeof configurationSidebar>
