/**
 * English Locale Configuration
 */

import type { DefaultTheme, LocaleSpecificConfig } from 'vitepress'

/**
 * English site configuration
 */
export const enConfig: LocaleSpecificConfig<DefaultTheme.Config> = {
  // Site metadata
  title: 'My Documentation Site',
  titleTemplate: 'Custom Title Suffix',
  description: 'Project documentation based on VitePress',
  lang: 'en-US',

  // Theme configuration
  themeConfig: {
    // Navigation bar configuration
    logo: '/logo.svg',
    siteTitle: 'Custom Navigation Title',
    
    // Navigation menu
    nav: [
      { text: 'Home', link: '/en/' },
      { text: 'Examples', link: '/en/markdown-examples' },
      { text: 'API', link: '/en/api-examples' },
      { text: 'Mermaid Diagrams', link: '/en/mermaid-examples' },
      { text: 'Juejin Link', link: 'https://juejin.cn' },
    ],

    // Sidebar
    sidebar: [
      {
        text: 'Examples',
        items: [
          { text: 'Markdown Examples', link: '/en/markdown-examples' },
          { text: 'Runtime API Examples', link: '/en/api-examples' },
          { text: 'Mermaid Diagram Examples', link: '/en/mermaid-examples' }
        ]
      }
    ],

    // Outline configuration
    outline: {
      level: [2, 5],
      label: 'On this page'
    },

    // Social links
    socialLinks: [
      { icon: 'github', link: 'https://github.com/your-username/your-repo' }
    ],

    // Footer
    footer: {
      message: 'Released under the MIT License',
      copyright: 'Copyright © 2024-present Your Name'
    },

    // Edit link
    editLink: {
      pattern: 'https://github.com/your-username/your-repo/edit/main/src/:path',
      text: 'Edit this page on GitHub'
    },

    // Last updated
    lastUpdated: {
      text: 'Last updated',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'medium'
      }
    },

    // Document footer
    docFooter: {
      prev: 'Previous',
      next: 'Next'
    },

    // Other text configuration
    darkModeSwitchLabel: 'Appearance',
    lightModeSwitchTitle: 'Switch to light mode',
    darkModeSwitchTitle: 'Switch to dark mode',
    sidebarMenuLabel: 'Menu',
    returnToTopLabel: 'Return to top',
    externalLinkIcon: true,

    // 404 page
    notFound: {
      title: 'Page Not Found',
      quote: 'It seems you have arrived in an unknown wilderness...',
      linkLabel: 'Go to home',
      linkText: 'Take me home'
    }
  }
}
