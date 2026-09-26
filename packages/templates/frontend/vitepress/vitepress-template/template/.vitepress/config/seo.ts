import type { HeadConfig } from 'vitepress'

/** 生产环境域名，用于拼接绝对路径 (避免社交分享图片失效) */
const VITE_SITE_URL = (import.meta.env?.VITE_VITE_SITE_URL as string)

/**
 * SEO 与 HTML <head> 头部标签配置
 * 包含基础 SEO、社交卡片 (Open Graph / Twitter)、Favicon 图标与移动端适配
 */
export const seoConfig: HeadConfig[] = [
  // ==================== 1. 基础 SEO & 浏览器设置 ====================
  /** 作者信息与关键字 */
  ['meta', { name: 'author', content: '您的名字' }],
  ['meta', { name: 'keywords', content: 'VitePress, Vue3, 前端文档, 开发指南' }],

  /** 移动端视口适配 (确保移动设备完美缩放) */
  ['meta', { name: 'viewport', content: 'width=device-width, initial-scale=1.0' }],

  /** 规范链接 (避免搜索引擎因多网址重复收录扣分) */
  ['link', { rel: 'canonical', href: VITE_SITE_URL }],

  // ==================== 2. Open Graph (微信/钉钉/Facebook 等社交分享卡片) ====================
  ['meta', { property: 'og:type', content: 'website' }],
  ['meta', { property: 'og:locale', content: 'zh_CN' }],
  ['meta', { property: 'og:title', content: '我的文档站点' }],
  ['meta', { property: 'og:description', content: '基于 VitePress 的项目文档' }],
  /** 分享预览图 (OG 图片强烈建议使用带域名的完整绝对路径) */
  ['meta', { property: 'og:image', content: `${VITE_SITE_URL}/og-image.png` }],

  // ==================== 3. Twitter Card (推特/X 社交卡片) ====================
  ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
  ['meta', { name: 'twitter:title', content: '我的文档站点' }],
  ['meta', { name: 'twitter:description', content: '基于 VitePress 的项目文档' }],
  ['meta', { name: 'twitter:image', content: `${VITE_SITE_URL}/og-image.png` }],

  // ==================== 4. 站点图标 (Favicon) ====================
  /** 通用 Favicon 与 Apple 设备桌面图标 */
  ['link', { rel: 'icon', href: '/favicon.ico' }],
  ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }],
  ['link', { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' }],

  // ==================== 5. 主题颜色 (移动端浏览器顶部标签栏颜色) ====================
  /** 浅色模式主题色 */
  ['meta', { name: 'theme-color', content: '#ffffff', media: '(prefers-color-scheme: light)' }],
  /** 深色模式主题色 */
  ['meta', { name: 'theme-color', content: '#1b1b1f', media: '(prefers-color-scheme: dark)' }]
]