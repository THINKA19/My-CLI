import { localesConfig, localeTexts } from '#config/menu/index'
import { mergeText, resolveLink, resolveNav, resolveSidebar, resolveSidebars, resolveText } from '#config/menu/resolve'
import { validateConfig, validateMenu } from '#config/menu/validate'
import { navStructure } from '#config/nav/index'
import { imageUrl, pageUrl } from '#config/seo'
import { sidebarSections } from '#config/sidebar/index'
import { resolveSiteUrl } from '#config/site'
import { transformSitemapItems } from '#config/sitemap'
import config from '../../.vitepress/config.ts'

export default {
  imageUrl,
  transformSitemapItems,
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
