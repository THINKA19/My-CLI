/**
 * 多语言 sitemap 配置，用于站外搜索引擎优化（SEO）。
 *
 * sitemap.xml 是提供给 Google、Bing 等搜索引擎的页面清单。
 * 本文件为清单补充语言对应关系，说明哪些中文、英文、越南文地址
 * 是同一篇文档的不同语言版本，帮助搜索引擎理解页面并选择合适的语言版本。
 * 它不参与站内搜索、导航或语言切换，也不保证提升排名或一定被收录。
 *
 * 当前中文使用 VitePress 的 root 配置标识，但实际页面位于 /zh/。
 * VitePress 默认的 sitemap 分组规则不能完整关联这种布局下的三语言页面，
 * 因此这里根据真实语言路径重新分组，仅关联实际存在的译文。
 *
 * site.ts 通过 sitemap.transformItems 注册此函数；它只在构建生成
 * sitemap.xml 时转换页面条目，最终文件仍由 VitePress 输出。
 */
import type { UserConfig } from 'vitepress'
import { languages } from '#config/menu/registry'

type SitemapItem = Parameters<NonNullable<NonNullable<UserConfig['sitemap']>['transformItems']>>[0][number]

/** 按真实语言路径关联译文，补齐 root 语言位于 /zh/ 时的替代链接。 */
export function transformSitemapItems(items: SitemapItem[]): SitemapItem[] {
  const groups = new Map<string, { lang: string, url: string }[]>()
  const pages = items.map((item) => {
    const locale = Object.values(languages).find(language => item.url.startsWith(language.prefix.slice(1)))
    const key = locale ? item.url.slice(locale.prefix.length - 1) : undefined
    if (locale && key !== undefined) {
      const variants = groups.get(key) ?? []
      variants.push({ lang: locale.lang, url: item.url })
      groups.set(key, variants)
    }
    return { item, key }
  })
  return pages.map(({ item, key }) => {
    // 仅把真实存在的译文加入列表；根跳转页和未翻译页面不制造替代链接。
    const { links: _links, ...page } = item
    const variants = key === undefined ? undefined : groups.get(key)
    return variants && variants.length > 1 ? { ...page, links: variants } : page
  })
}
