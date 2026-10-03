/**
 * Cấu hình ngôn ngữ tiếng Việt (Vietnamese Locale Configuration)
 */

import type { DefaultTheme, LocaleSpecificConfig } from 'vitepress'

/**
 * Cấu hình trang web tiếng Việt
 */
export const viConfig: LocaleSpecificConfig<DefaultTheme.Config> = {
  // Metadata trang web
  title: 'Trang Tài liệu của Tôi',
  titleTemplate: 'Hậu tố Tiêu đề Tùy chỉnh',
  description: 'Tài liệu dự án dựa trên VitePress',
  lang: 'vi-VN',

  // Cấu hình giao diện
  themeConfig: {
    // Cấu hình thanh điều hướng
    logo: '/logo.svg',
    siteTitle: 'Tiêu đề Điều hướng Tùy chỉnh',
    
    // Menu điều hướng
    nav: [
      { text: 'Trang chủ', link: '/vi/' },
      { text: 'Ví dụ', link: '/vi/markdown-examples' },
      { text: 'API', link: '/vi/api-examples' },
      { text: 'Sơ đồ Mermaid', link: '/vi/mermaid-examples' },
      { text: 'Liên kết Juejin', link: 'https://juejin.cn' },
    ],

    // Thanh bên
    sidebar: [
      {
        text: 'Ví dụ',
        items: [
          { text: 'Ví dụ Markdown', link: '/vi/markdown-examples' },
          { text: 'Ví dụ Runtime API', link: '/vi/api-examples' },
          { text: 'Ví dụ Sơ đồ Mermaid', link: '/vi/mermaid-examples' }
        ]
      }
    ],

    // Cấu hình mục lục trang
    outline: {
      level: [2, 5],
      label: 'Trên trang này'
    },

    // Liên kết mạng xã hội
    socialLinks: [
      { icon: 'github', link: 'https://github.com/your-username/your-repo' }
    ],

    // Chân trang
    footer: {
      message: 'Được phát hành theo Giấy phép MIT',
      copyright: 'Bản quyền © 2024-present Tên của bạn'
    },

    // Liên kết chỉnh sửa
    editLink: {
      pattern: 'https://github.com/your-username/your-repo/edit/main/src/:path',
      text: 'Chỉnh sửa trang này trên GitHub'
    },

    // Thời gian cập nhật cuối
    lastUpdated: {
      text: 'Cập nhật lần cuối',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'medium'
      }
    },

    // Chân trang tài liệu
    docFooter: {
      prev: 'Trang trước',
      next: 'Trang tiếp theo'
    },

    // Cấu hình văn bản khác
    darkModeSwitchLabel: 'Giao diện',
    lightModeSwitchTitle: 'Chuyển sang chế độ sáng',
    darkModeSwitchTitle: 'Chuyển sang chế độ tối',
    sidebarMenuLabel: 'Menu',
    returnToTopLabel: 'Quay lại đầu trang',
    externalLinkIcon: true,

    // Trang 404
    notFound: {
      title: 'Không tìm thấy trang',
      quote: 'Có vẻ như bạn đã đến một vùng đất hoang dã chưa được biết đến...',
      linkLabel: 'Về trang chủ',
      linkText: 'Đưa tôi về nhà'
    }
  }
}
