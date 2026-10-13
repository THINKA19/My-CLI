import config from '../../.vitepress/config'
import { localesConfig, localeTexts } from '../../.vitepress/config/i18n'
import { mergeText, resolveLink, resolveNav, resolveSidebar, resolveSidebars, resolveText } from '../../.vitepress/config/i18n/resolve'
import { validateConfig, validateMenu } from '../../.vitepress/config/i18n/validate'
import { navStructure } from '../../.vitepress/config/nav'
import { pageUrl } from '../../.vitepress/config/seo'
import { sidebarSections } from '../../.vitepress/config/sidebar'
import { resolveSiteUrl } from '../../.vitepress/config/site'

export default {
  pageUrl,
  resolveSiteUrl,
  config,
  localeTexts,
  localesConfig,
  mergeText,
  resolveLink,
  resolveNav,
  resolveSidebar,
  resolveSidebars,
  resolveText,
  validateMenu,
  validateConfig,
  navStructure,
  sidebarSections,
}
