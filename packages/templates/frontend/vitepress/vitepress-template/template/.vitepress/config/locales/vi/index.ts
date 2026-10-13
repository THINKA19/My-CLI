import type { LocaleText } from '#config/i18n/types'
import { nav } from '#config/locales/vi/nav/index'
import { search } from './search.ts'
import { seoConfig as seo } from './seo.ts'
import { sidebar } from '#config/locales/vi/sidebar/index'
import { siteConfig as site } from './site.ts'
import { themeConfig as theme } from './theme.ts'

export const vi = { site, theme, seo, nav, sidebar, search } satisfies LocaleText
