import type { DefaultTheme, HeadConfig, LocaleConfig } from 'vitepress'
import type { Language, LocaleText } from './types.ts'
import { en } from '#config/locales/en/index'
import { vi } from '#config/locales/vi/index'
import { zh } from '#config/locales/zh/index'
import { navStructure } from '#config/nav/index'
import { sidebarSections } from '#config/sidebar/index'
import { themeConfig } from '#config/theme'
import { languages } from './registry.ts'
import { filterMenu, resolveNav, resolveSidebars } from './resolve.ts'
import { validateConfig } from './validate.ts'

export const localeTexts = { zh, en, vi } satisfies Record<Language, LocaleText>

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
        outline: { ...themeConfig.outline, ...text.theme.outline },
        editLink: { ...themeConfig.editLink, ...text.theme.editLink },
        lastUpdated: { ...themeConfig.lastUpdated, ...text.theme.lastUpdated },
        nav: resolveNav(filterMenu(navStructure, code), text.nav, fallback.nav, locale.prefix),
        sidebar: resolveSidebars(sidebarSections.map(section => ({ ...section, items: filterMenu(section.items, code) })).filter(section => section.items.length), text.sidebar, fallback.sidebar, locale.prefix),
      },
    }]
  }),
)
