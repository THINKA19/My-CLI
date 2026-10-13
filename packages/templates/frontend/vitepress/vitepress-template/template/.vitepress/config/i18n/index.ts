import type { DefaultTheme, HeadConfig, LocaleConfig } from 'vitepress'
import type { Language, LocaleText } from './types'
import { en } from '../locales/en'
import { vi } from '../locales/vi'
import { zh } from '../locales/zh'
import { navStructure } from '../nav'
import { sidebarSections } from '../sidebar'
import { themeConfig } from '../theme'
import { languages } from './registry'
import { resolveNav, resolveSidebars } from './resolve'
import { validateConfig } from './validate'

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
        nav: resolveNav(navStructure, text.nav, fallback.nav, locale.prefix),
        sidebar: resolveSidebars(sidebarSections, text.sidebar, fallback.sidebar, locale.prefix),
      },
    }]
  }),
)
