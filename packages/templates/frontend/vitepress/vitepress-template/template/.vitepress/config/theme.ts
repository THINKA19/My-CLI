import type { DefaultTheme } from 'vitepress'

/**
 * 默认主题
 * nav：导航菜单项
 * sidebar：侧边栏菜单项
 * aside：aside 容器
 * algolia： Algolia DocSearch 
 * carbonAds： Carbon Ads
 * langMenuLabel：导航栏中语言切换按钮
 */
export const themeConfig: DefaultTheme.Config = {
  logo: '/logo.svg',
  siteTitle: '自定义导航栏标题',
  outline: {
    level: [2, 5],
    label: '本页目录'
  },
  socialLinks: [
    { icon: 'github', link: 'https://github.com/your-username/your-repo' }
  ],
  footer: {
    message: '基于 MIT 许可协议发布',
    copyright: 'Copyright © 2024-present 您的名字'
  },
  editLink: {
    pattern: 'https://github.com/your-username/your-repo/edit/main/src/:path',
    text: '在 GitHub 上编辑此页'
  },
  lastUpdated: {
    text: '最后更新于',
    formatOptions: {
      dateStyle: 'short',
      timeStyle: 'medium'
    }
  },
  docFooter: {
    prev: '上一页',
    next: '下一页'
  },
  darkModeSwitchLabel: '外观',
  lightModeSwitchTitle: '切换到浅色模式',
  darkModeSwitchTitle: '切换到深色模式',
  sidebarMenuLabel: '菜单',
  returnToTopLabel: '回到顶部',
  externalLinkIcon: true,

   notFound: {
    title: '页面未找到',
    quote: '看似你来到了一个未知的荒野...',
    linkLabel: '返回首页',
    linkText: '带我回家'
  }
}