import type { MenuNode } from '../../.vitepress/config/i18n/types.ts'
import type { Bundle, Extra, Input, Page } from './schema.ts'
import path from 'node:path'
import { resolveNav, resolveSidebar } from '../../.vitepress/config/i18n/resolve.ts'

export function build(input: Input): Bundle {
  const { codes, primary, pages } = input
  const byLanguage = Object.fromEntries(codes.map(code => [code, new Map<string, Page>()]))
  const routes = Object.fromEntries(codes.map(code => [code, new Set<string>()]))
  for (const page of pages) {
    const map = byLanguage[page.language]
    if (map.has(page.id) || routes[page.language].has(page.route))
      throw new Error(`重复页面 ID 或路径: ${page.language}/${page.relative}`)
    map.set(page.id, page)
    routes[page.language].add(page.route)
  }
  const base = [...byLanguage[primary].values()]
  for (const page of base) {
    for (const code of codes) {
      const translated = byLanguage[code].get(page.id)
      if (!translated && page.translate)
        throw new Error(`${code} 缺少翻译页面: ${page.id}`)
      if (translated && translated.route !== page.route)
        throw new Error(`多语言页面路径必须一致: ${page.id}`)
    }
  }
  for (const code of codes) {
    for (const page of byLanguage[code].values()) {
      if (!byLanguage[primary].has(page.id))
        throw new Error(`${code} 页面没有默认语言对应项: ${page.id}`)
    }
  }
  const texts: Bundle['texts'] = Object.fromEntries(codes.map(code => [code, { nav: {}, sidebar: {} }]))
  const available = (page: Page) => page.translate ? codes : [primary]
  function node(page: Page, kind: 'nav' | 'sidebar'): MenuNode {
    const key = `${kind}.${page.id}`
    for (const code of available(page)) {
      const translation = byLanguage[code].get(page.id)!
      texts[code][kind][key] = translation.menu[kind]?.text ?? translation.title
    }
    return { key, languages: available(page), ...(page.menu[kind]?.activeMatch ? { activeMatch: page.menu[kind]!.activeMatch } : {}) }
  }
  const compare = (kind: 'nav' | 'sidebar') => (a: Page, b: Page) => {
    const x = a.menu[kind]?.order ?? Infinity
    const y = b.menu[kind]?.order ?? Infinity
    return x === y ? (a.relative < b.relative ? -1 : a.relative > b.relative ? 1 : 0) : x < y ? -1 : 1
  }
  const navById = new Map<string, { node: MenuNode, parent?: string, order: number, name: string }>()
  const enabled = base.filter(page => page.menu.nav?.enabled)
  for (const page of enabled.sort(compare('nav'))) {
    if (codes.some(code => page.menu.nav?.activeMatch?.startsWith(`^/${code}/`)))
      throw new Error(`activeMatch 不能带语言前缀: ${page.id}`)
    const item = node(page, 'nav')
    if (page.menu.nav?.mode === 'dropdown')
      item.items = []
    else item.link = { path: page.route }
    let parent = page.menu.nav?.parent
    if (!parent) {
      let dir = path.posix.dirname(page.relative)
      while (dir !== '.') {
        const group = enabled.find(other => other.relative === `${dir}/index.md` && other.id !== page.id && other.menu.nav?.mode === 'dropdown')
        if (group) {
          parent = group.id
          break
        }
        dir = path.posix.dirname(dir)
      }
    }
    navById.set(page.id, { node: item, parent, order: page.menu.nav?.order ?? Infinity, name: page.relative })
  }
  function extra(items: Extra[], parent?: string): void {
    for (const item of items) {
      if (!item || typeof item.id !== 'string' || !/^[\w./-]+$/.test(item.id) || !item.text || Object.keys(item).some(key => !['id', 'text', 'order', 'parent', 'link', 'items'].includes(key)))
        throw new Error('无效外部菜单配置')
      if (byLanguage[primary].has(item.id) || navById.has(item.id))
        throw new Error(`重复菜单 ID: ${item.id}`)
      if (item.order !== undefined && !Number.isFinite(item.order))
        throw new Error(`无效菜单排序: ${item.id}`)
      if (item.parent !== undefined && typeof item.parent !== 'string')
        throw new Error(`无效父分组: ${item.id}`)
      if (item.link && item.items)
        throw new Error(`菜单不能同时有链接与子项: ${item.id}`)
      if (item.link && !/^(?:https?:\/\/|mailto:|tel:)/.test(item.link))
        throw new Error(`menu.config.ts 只接受外部链接: ${item.id}`)
      if (!item.link && !Array.isArray(item.items))
        throw new Error(`分组需要 items 数组: ${item.id}`)
      const key = `nav.${item.id}`
      for (const code of codes) {
        if (typeof item.text[code] !== 'string' || !item.text[code].trim())
          throw new Error(`${code} 缺少外部菜单翻译: ${item.id}`)
        texts[code].nav[key] = item.text[code]
      }
      navById.set(item.id, { node: { key, ...(item.link ? { link: { url: item.link } } : { items: [] }) }, parent: item.parent ?? parent, order: item.order ?? Infinity, name: item.id })
      if (item.items)
        extra(item.items, item.id)
    }
  }
  extra(input.extras)
  const nav: MenuNode[] = []
  const sorted = [...navById.entries()].sort((a, b) => a[1].order === b[1].order ? a[1].name.localeCompare(b[1].name, 'en') : a[1].order < b[1].order ? -1 : 1)
  for (const [id, entry] of sorted) {
    const seen = new Set([id])
    let parent = entry.parent
    while (parent) {
      if (seen.has(parent))
        throw new Error(`导航循环引用: ${id}`)
      seen.add(parent)
      const group = navById.get(parent)
      if (!group?.node.items)
        throw new Error(`父导航分组不存在或不是下拉菜单: ${parent}`)
      parent = group.parent
    }
    if (entry.parent)
      (navById.get(entry.parent)!.node.items as MenuNode[]).push(entry.node)
    else nav.push(entry.node)
  }
  function sidebar(dir: string, depth: number): MenuNode[] {
    if (depth > 6)
      throw new Error('侧边栏超过六层分组')
    const prefix = dir ? `${dir}/` : ''
    const children = base.filter(page => page.relative.startsWith(prefix) && !page.relative.slice(prefix.length).includes('/') && page.relative !== `${prefix}index.md`)
    const dirs = [...new Set(base.filter(page => page.relative.startsWith(prefix) && page.relative.slice(prefix.length).includes('/')).map(page => page.relative.slice(prefix.length).split('/')[0]))]
    const ordered: { item: MenuNode, order: number, name: string }[] = []
    for (const page of children.filter(page => page.menu.sidebar?.enabled !== false)) ordered.push({ item: { ...node(page, 'sidebar'), link: { path: page.route } }, order: page.menu.sidebar?.order ?? Infinity, name: page.relative })
    for (const child of dirs) {
      const subdir = `${prefix}${child}`
      const index = base.find(page => page.relative === `${subdir}/index.md`)
      if (index?.menu.sidebar?.enabled === false)
        continue
      const items = sidebar(subdir, depth + 1)
      if (!items.length && !index)
        continue
      const group = index ? node(index, 'sidebar') : { key: `sidebar.directory.${subdir}` }
      if (!index) {
        for (const code of codes) texts[code].sidebar[group.key] = child
      }
      if (items.length)
        group.items = items
      if (index && index.menu.sidebar?.linkToIndex !== false)
        group.link = { path: index.route }
      if (index?.menu.sidebar?.collapsed !== undefined)
        group.collapsed = index.menu.sidebar.collapsed
      if (!group.link && !group.items?.length)
        throw new Error(`空侧边栏分组: ${subdir}`)
      ordered.push({ item: group, order: index?.menu.sidebar?.order ?? Infinity, name: subdir })
    }
    return ordered.sort((a, b) => a.order === b.order ? a.name < b.name ? -1 : 1 : a.order < b.order ? -1 : 1).map(entry => entry.item)
  }
  const rootItems = sidebar('', 1)
  const sidebarSections = rootItems.map((item) => {
    const page = base.find(page => `sidebar.${page.id}` === item.key)
    const dir = page?.relative.endsWith('/index.md') ? path.posix.dirname(page.relative) : item.key.replace('sidebar.directory.', '')
    return item.items ? { id: dir, prefix: `/${dir}/`, items: [item] } : null
  }).filter(item => item !== null)
  const rootPages = rootItems.filter(item => !item.items)
  if (rootPages.length)
    sidebarSections.push({ id: 'root', prefix: '/', items: rootPages })
  for (const code of codes) {
    const filter = (nodes: readonly MenuNode[]): MenuNode[] => nodes.filter(item => !item.languages || item.languages.includes(code)).map(item => ({ ...item, ...(item.items ? { items: filter(item.items) } : {}) })).filter(item => item.link || item.items?.length)
    const validateGroups = (nodes: readonly MenuNode[]) => {
      for (const item of nodes) {
        if (item.items && !item.items.length)
          throw new Error(`空导航分组: ${item.key}`)
        if (item.items)
          validateGroups(item.items)
      }
    }
    validateGroups(nav)
    resolveNav(filter(nav), texts[code].nav, {}, `/${code}/`)
    for (const section of sidebarSections) resolveSidebar(filter(section.items), texts[code].sidebar, {}, `/${code}/`)
    for (const kind of ['nav', 'sidebar'] as const) {
      const keys = new Set<string>()
      const links = new Set<string>()
      const visit = (nodes: readonly MenuNode[]) => {
        for (const item of nodes) {
          if (keys.has(item.key))
            throw new Error(`重复菜单 key: ${item.key}`)
          keys.add(item.key)
          if (item.link) {
            const link = item.link.path ?? item.link.url
            if (links.has(link))
              throw new Error(`重复菜单链接: ${link}`)
            links.add(link)
          }
          if (item.items)
            visit(item.items)
        }
      }
      visit(filter(kind === 'nav' ? nav : sidebarSections.flatMap(section => section.items)))
    }
  }
  return { nav, sidebar: sidebarSections, texts }
}
