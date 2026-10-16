import type { ThemeText } from '#config/menu/types'

export const themeConfig = {
  siteTitle: 'Tiêu đề Điều hướng Tùy chỉnh',
  outline: {
    label: 'Trên trang này',
  },
  footer: {
    message: 'Được phát hành theo Giấy phép MIT',
    copyright: 'Bản quyền © 2024-present Tên của bạn',
  },
  editLink: {
    text: 'Chỉnh sửa trang này trên GitHub',
  },
  lastUpdated: {
    text: 'Cập nhật lần cuối',
  },
  docFooter: {
    prev: 'Trang trước',
    next: 'Trang tiếp theo',
  },
  darkModeSwitchLabel: 'Giao diện',
  lightModeSwitchTitle: 'Chuyển sang chế độ sáng',
  darkModeSwitchTitle: 'Chuyển sang chế độ tối',
  sidebarMenuLabel: 'Menu',
  returnToTopLabel: 'Quay lại đầu trang',
  langMenuLabel: 'Ngôn ngữ',
  notFound: {
    title: 'Không tìm thấy trang',
    quote: 'Có vẻ như bạn đã đến một vùng đất hoang dã chưa được biết đến...',
    linkLabel: 'Về trang chủ',
    linkText: 'Đưa tôi về nhà',
  },
} satisfies ThemeText
