import type { DefaultTheme, HeadConfig, LocaleConfig } from 'vitepress'
import type { Language, LocaleText } from './types.ts'
__LOCALE_IMPORTS__
import { navStructure } from '#config/nav/index'
import { sidebarSections } from '#config/sidebar/index'
import { themeConfig } from '#config/theme'
import { languages } from './registry.ts'
import { filterMenu, resolveNav, resolveSidebars } from './resolve.ts'
import { validateConfig } from './validate.ts'

// 各语言入口负责组装，类型检查确保新增语言时补齐配置。
export const localeTexts = __LOCALE_TEXTS__ satisfies Record<Language, LocaleText>

// 构建前检查目标页面，阻止缺失译文或无效链接进入最终站点。
validateConfig(navStructure, sidebarSections, localeTexts)

export const localesConfig: LocaleConfig<DefaultTheme.Config> = Object.fromEntries(
  Object.entries(languages).map(([code, locale]) => {
    const text = localeTexts[code as Language]
    const fallback = localeTexts[locale.fallback]
    return [locale.configKey, {
      label: locale.label,
      lang: locale.lang,
      link: locale.prefix,
      title: text.site.title,
      titleTemplate: text.site.titleTemplate,
      description: text.site.description,
      head: [
        ['meta', { name: 'author', content: text.seo.author }],
        ['meta', { name: 'keywords', content: text.seo.keywords }],
        ['meta', { property: 'og:locale', content: text.seo.ogLocale }],
      ] satisfies HeadConfig[],
      themeConfig: {
        ...themeConfig,
        ...text.theme,
        // 嵌套对象显式合并，让翻译只覆盖文字而不丢失公共行为设置。
        outline: { ...themeConfig.outline, ...text.theme.outline },
        editLink: { ...themeConfig.editLink, ...text.theme.editLink },
        lastUpdated: { ...themeConfig.lastUpdated, ...text.theme.lastUpdated },
        nav: resolveNav(filterMenu(navStructure, code), text.nav, fallback.nav, locale.prefix),
        sidebar: resolveSidebars(sidebarSections.map(section => ({ ...section, items: filterMenu(section.items, code) })).filter(section => section.items.length), text.sidebar, fallback.sidebar, locale.prefix),
      },
    }]
  }),
)
