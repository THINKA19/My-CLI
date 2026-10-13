import { localesConfig, localeTexts } from '#config/i18n/index'
import { mergeText, resolveLink, resolveNav, resolveSidebar, resolveSidebars, resolveText } from '#config/i18n/resolve'
import { validateConfig, validateMenu } from '#config/i18n/validate'
import { navStructure } from '#config/nav/index'
import { pageUrl } from '#config/seo'
import { sidebarSections } from '#config/sidebar/index'
import { resolveSiteUrl } from '#config/site'
import config from '../../.vitepress/config'

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
