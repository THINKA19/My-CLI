/**
 * 中文语言配置 (Chinese Locale Configuration)
 */

import type { DefaultTheme, LocaleSpecificConfig } from 'vitepress'

/**
 * 中文站点配置
 */
export const zhConfig: LocaleSpecificConfig<DefaultTheme.Config> = {
  // 站点元数据
  title: '我的文档站点',
  titleTemplate: '自定义标题后缀',
  description: '基于 VitePress 的项目文档',
  lang: 'zh-CN',

  // 主题配置
  themeConfig: {
    // 导航栏配置
    logo: '/logo.svg',
    siteTitle: '自定义导航栏标题',
    
    // 导航菜单
    nav: [
      { text: '首页', link: '/' },
      { text: '示例', link: '/markdown-examples' },
      { text: 'API', link: '/api-examples' },
      { text: '掘金链接', link: 'https://juejin.cn' },
    ],

    // 侧边栏
    sidebar: [
      {
        text: '示例',
        items: [
          { text: 'Markdown 示例', link: '/markdown-examples' },
          { text: 'Runtime API 示例', link: '/api-examples' }
        ]
      }
    ],

    // 页面大纲配置
    outline: {
      level: [2, 5],
      label: '本页目录'
    },

    // 社交链接
    socialLinks: [
      { icon: 'github', link: 'https://github.com/your-username/your-repo' }
    ],

    // 页脚
    footer: {
      message: '基于 MIT 许可协议发布',
      copyright: 'Copyright © 2024-present 您的名字'
    },

    // 编辑链接
    editLink: {
      pattern: 'https://github.com/your-username/your-repo/edit/main/src/:path',
      text: '在 GitHub 上编辑此页'
    },

    // 最后更新时间
    lastUpdated: {
      text: '最后更新于',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'medium'
      }
    },

    // 文档页脚
    docFooter: {
      prev: '上一页',
      next: '下一页'
    },

    // 其他文本配置
    darkModeSwitchLabel: '外观',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',
    sidebarMenuLabel: '菜单',
    returnToTopLabel: '回到顶部',
    externalLinkIcon: true,

    // 404 页面
    notFound: {
      title: '页面未找到',
      quote: '看似你来到了一个未知的荒野...',
      linkLabel: '返回首页',
      linkText: '带我回家'
    }
  }
}
