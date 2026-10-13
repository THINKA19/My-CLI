import type { HeadConfig, TransformContext } from 'vitepress'
import { languages } from './i18n/registry'
import { siteConfig, siteUrl } from './site'

export const seoConfig: HeadConfig[] = [
  ['meta', { name: 'viewport', content: 'width=device-width, initial-scale=1.0' }],
  ['meta', { property: 'og:type', content: 'website' }],
  ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
  ['link', { rel: 'icon', href: `${siteConfig.base}favicon.ico` }],
  ['link', { rel: 'icon', type: 'image/svg+xml', href: `${siteConfig.base}logo.svg` }],
  ['link', { rel: 'apple-touch-icon', href: `${siteConfig.base}apple-touch-icon.png` }],
  ['meta', { name: 'theme-color', content: '#ffffff', media: '(prefers-color-scheme: light)' }],
  ['meta', { name: 'theme-color', content: '#1b1b1f', media: '(prefers-color-scheme: dark)' }],
]

export function pageUrl(page: string, baseUrl = siteUrl, cleanUrls = true): string {
  const route = page.replace(/\.(md|html)$/, '')
  const pathname = route === 'index'
    ? ''
    : route.endsWith('/index')
      ? route.slice(0, -5)
      : cleanUrls ? route : `${route}.html`
  return new URL(pathname, baseUrl).href
}

export function transformHead(context: TransformContext): HeadConfig[] {
  const { page, title, description, pageData, head } = context
  const canonical = pageUrl(page, siteUrl, context.siteConfig.cleanUrls)
  const imagePath = typeof pageData.frontmatter.image === 'string'
    ? pageData.frontmatter.image
    : 'og-image.png'
  const image = /^https?:\/\//.test(imagePath)
    ? imagePath
    : new URL(imagePath.replace(/^\//, ''), siteUrl).href
  const result: HeadConfig[] = [
    ['meta', { property: 'og:title', content: title }],
    ['meta', { property: 'og:description', content: description }],
    ['meta', { property: 'og:url', content: canonical }],
    ['meta', { property: 'og:image', content: image }],
    ['meta', { name: 'twitter:title', content: title }],
    ['meta', { name: 'twitter:description', content: description }],
    ['meta', { name: 'twitter:image', content: image }],
  ]
  if (page === 'index.md' || page === 'index.html') {
    const language = Object.values(languages).find(locale => locale.configKey === 'root')!
    result.push(['meta', {
      'http-equiv': 'refresh',
      'content': `0;url=${siteConfig.base}${language.prefix.slice(1)}`,
    }])
  }
  if (!head.some(([tag, attrs]) => tag === 'link' && attrs.rel === 'canonical'))
    result.push(['link', { rel: 'canonical', href: canonical }])
  // 尊重页面 frontmatter 中显式设置的分享标签。
  return result.filter(([, attrs]) => !head.some(([tag, existing]) => tag === 'meta'
    && (attrs.property ? existing.property === attrs.property : attrs.name && existing.name === attrs.name)))
}
