import type { LocaleText } from '../../i18n/types'
import { nav } from './nav'
import { search } from './search'
import { seoConfig as seo } from './seo'
import { sidebar } from './sidebar'
import { siteConfig as site } from './site'
import { themeConfig as theme } from './theme'

export const vi = { site, theme, seo, nav, sidebar, search } satisfies LocaleText
