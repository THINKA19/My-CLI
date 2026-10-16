import type { ThemeText } from '#config/menu/types'

export const themeConfig = {
  siteTitle: '自定义导航栏标题',
  outline: {
    label: '本页目录',
  },
  footer: {
    message: '基于 MIT 许可协议发布',
    copyright: 'Copyright © 2024-present 您的名字',
  },
  editLink: {
    text: '在 GitHub 上编辑此页',
  },
  lastUpdated: {
    text: '最后更新于',
  },
  docFooter: {
    prev: '上一页',
    next: '下一页',
  },
  darkModeSwitchLabel: '外观',
  lightModeSwitchTitle: '切换到浅色模式',
  darkModeSwitchTitle: '切换到深色模式',
  sidebarMenuLabel: '菜单',
  returnToTopLabel: '回到顶部',
  langMenuLabel: '语言',
  notFound: {
    title: '页面未找到',
    quote: '看似你来到了一个未知的荒野...',
    linkLabel: '返回首页',
    linkText: '带我回家',
  },
} satisfies ThemeText
