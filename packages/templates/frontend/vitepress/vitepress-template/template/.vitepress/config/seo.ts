import type { HeadConfig, TransformContext } from 'vitepress'
import { languages } from '#config/i18n/registry'
import { siteConfig, siteUrl } from './site.ts'

export const seoConfig: HeadConfig[] = [
  ['meta', { name: 'viewport', content: 'width=device-width, initial-scale=1.0' }],
  ['meta', { property: 'og:type', content: 'website' }],
  // 模板只引用随项目提供的图标，额外图标由站点维护者自行配置。
  ['link', { rel: 'icon', type: 'image/svg+xml', href: `${siteConfig.base}logo.svg` }],
  ['meta', { name: 'theme-color', content: '#ffffff', media: '(prefers-color-scheme: light)' }],
  ['meta', { name: 'theme-color', content: '#1b1b1f', media: '(prefers-color-scheme: dark)' }],
]

/** 栏目 index 对应目录地址；文章是否保留 .html 跟随站点设置。 */
export function pageUrl(page: string, baseUrl = siteUrl, cleanUrls = true): string {
  const route = page.replace(/\.(md|html)$/, '')
  const pathname = route === 'index'
    ? ''
    : route.endsWith('/index')
      ? route.slice(0, -5)
      : cleanUrls ? route : `${route}.html`
  return new URL(pathname, baseUrl).href
}

/** 相对图片以部署目录为根；绝对路径和 CDN 地址遵循标准 URL 解析。 */
export function imageUrl(image: string, baseUrl = siteUrl): string {
  const url = new URL(image, baseUrl)
  if (!['http:', 'https:'].includes(url.protocol))
    throw new Error('分享图片必须是 HTTP(S) 地址或站内路径')
  return url.href
}

export function transformHead(context: TransformContext): HeadConfig[] {
  const { page, title, description, pageData, head } = context
  const canonical = pageUrl(page, siteUrl, context.siteConfig.cleanUrls)
  // 分享图片按页面显式提供，避免默认输出不存在的图片地址。
  const imagePath = typeof pageData.frontmatter.image === 'string' ? pageData.frontmatter.image.trim() : ''
  const image = imagePath ? imageUrl(imagePath) : undefined
  const hasImage = image || head.some(([tag, attrs]) => tag === 'meta'
    && (attrs.property === 'og:image' || attrs.name === 'twitter:image'))
  const result: HeadConfig[] = [
    ['meta', { property: 'og:title', content: title }],
    ['meta', { property: 'og:description', content: description }],
    ['meta', { property: 'og:url', content: canonical }],
    ['meta', { name: 'twitter:card', content: hasImage ? 'summary_large_image' : 'summary' }],
    ['meta', { name: 'twitter:title', content: title }],
    ['meta', { name: 'twitter:description', content: description }],
  ]
  if (image) {
    result.push(['meta', { property: 'og:image', content: image }], ['meta', { name: 'twitter:image', content: image }])
  }
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
