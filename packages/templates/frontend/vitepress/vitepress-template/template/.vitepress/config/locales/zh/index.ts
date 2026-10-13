import type { LocaleText } from '#config/i18n/types'
import { generatedTexts } from '#config/nav/index'
import { search } from './search.ts'
import { seoConfig as seo } from './seo.ts'
import { siteConfig as site } from './site.ts'
import { themeConfig as theme } from './theme.ts'

const { nav, sidebar } = generatedTexts.zh

export const zh = { site, theme, seo, nav, sidebar, search } satisfies LocaleText
