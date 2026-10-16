import type { Language, LocaleText, MenuNode, SidebarSection } from './types.ts'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { languages } from './registry.ts'
import { filterMenu } from './resolve.ts'

const srcDir = fileURLToPath(new URL('../../../src/', import.meta.url))

export function validateMenu(
  nodes: readonly MenuNode[],
  text: Record<string, string>,
  language: Language,
  sourceRoot = srcDir,
): void {
  // 文档路径从当前语言的源目录解析，校验时不附加部署 base。
  const keys = new Set<string>()
  const links = new Set<string>()
  const sourceDir = path.resolve(sourceRoot, languages[language].sourceDir)
  const visit = (items: readonly MenuNode[], depth: number) => {
    if (depth > 6)
      throw new Error('菜单超过默认侧边栏支持的六层嵌套')
    for (const node of items) {
      if (keys.has(node.key))
        throw new Error(`重复菜单 key: ${node.key}`)
      keys.add(node.key)
      if (!text[node.key]?.trim())
        throw new Error(`${language} 缺少文案: ${node.key}`)
      if (!node.link && !node.items?.length)
        throw new Error(`空菜单项: ${node.key}`)
      if (node.link) {
        const link = node.link.path ?? node.link.url
        if (links.has(link))
          throw new Error(`重复菜单链接: ${link}`)
        links.add(link)
        if (node.link.path !== undefined) {
          const route = node.link.path.split(/[?#]/)[0]
          if (!route.startsWith('/') || route.startsWith('//') || route.includes('\\')
            || route.split('/').some(part => part === '..' || part === '.')) {
            throw new Error(`站内路径无效: ${route}`)
          }
          for (const locale of Object.values(languages)) {
            if (locale.prefix.length > 1 && (route === locale.prefix.slice(0, -1) || route.startsWith(locale.prefix)))
              throw new Error(`结构路径不能带语言前缀: ${route}`)
          }
          const decoded = decodeURIComponent(route)
          // 解码后再检查目录边界，防止编码路径绕过普通字符串校验。
          const local = path.resolve(sourceDir, `.${decoded}`)
          if (local !== sourceDir && !local.startsWith(sourceDir + path.sep))
            throw new Error(`路径超出文档目录: ${route}`)
          const stem = local.replace(/\.html$/, '')
          const candidates = route.endsWith('/')
            ? [path.join(local, 'index.md')]
            : [`${stem}.md`, path.join(stem, 'index.md')]
          if (!candidates.some(file => fs.existsSync(file)))
            throw new Error(`${language} 菜单目标页面不存在: ${route}`)
        }
      }
      if (node.items)
        visit(node.items, depth + 1)
    }
  }
  visit(nodes, 1)
}

export function validateConfig(
  nav: readonly MenuNode[],
  sections: readonly SidebarSection[],
  texts: Record<Language, LocaleText>,
): void {
  const localeKeys = new Set<string>()
  const prefixes = new Set<string>()
  for (const [code, locale] of Object.entries(languages)) {
    if (localeKeys.has(locale.configKey) || prefixes.has(locale.prefix))
      throw new Error(`语言 key 或路径前缀重复: ${code}`)
    localeKeys.add(locale.configKey)
    prefixes.add(locale.prefix)
    if (!Object.hasOwn(languages, locale.fallback))
      throw new Error(`回退语言不存在: ${code}`)
    if (!locale.prefix.startsWith('/') || !locale.prefix.endsWith('/'))
      throw new Error(`语言前缀必须以 / 开头和结尾: ${code}`)
    const language = code as Language
    validateMenu(filterMenu(nav, language), texts[language].nav, language)
    for (const section of sections) validateMenu(filterMenu(section.items, language), texts[language].sidebar, language)
  }
  const ids = new Set<string>()
  const routes = new Set<string>()
  for (const section of sections) {
    if (ids.has(section.id) || routes.has(section.prefix))
      throw new Error(`侧边栏分区重复: ${section.id}`)
    if (!section.prefix.startsWith('/') || !section.prefix.endsWith('/'))
      throw new Error(`侧边栏前缀必须以 / 开头和结尾: ${section.prefix}`)
    ids.add(section.id)
    routes.add(section.prefix)
  }
}
