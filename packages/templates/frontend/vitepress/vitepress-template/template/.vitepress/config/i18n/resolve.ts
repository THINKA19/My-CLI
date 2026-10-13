import type { DefaultTheme } from 'vitepress'
import type { LinkTarget, MenuNode, SidebarMap, SidebarSection } from './types.ts'

type TextKeys<Text> = Text extends Record<string, string> ? keyof Text : never

export function mergeText<const Parts extends readonly Record<string, string>[]>(
  ...parts: Parts
): Record<TextKeys<Parts[number]>, string> {
  const result: Record<string, string> = {}
  for (const part of parts) {
    for (const [key, value] of Object.entries(part)) {
      if (Object.hasOwn(result, key))
        throw new Error(`重复文案 key: ${key}`)
      result[key] = value
    }
  }
  return result as Record<TextKeys<Parts[number]>, string>
}

export function resolveText(key: string, text: Record<string, string>, fallback: Record<string, string>): string {
  const value = text[key] || fallback[key]
  if (!value)
    throw new Error(`缺少文案: ${key}`)
  return value
}

export function resolvePath(path: string, prefix: string): string {
  return prefix === '/' ? path : prefix + path.slice(1)
}

export function resolveLink(link: LinkTarget, prefix: string): string {
  return link.path !== undefined ? resolvePath(link.path, prefix) : link.url
}

export function resolveNav(
  nodes: readonly MenuNode[],
  text: Record<string, string>,
  fallback: Record<string, string>,
  prefix: string,
  depth = 0,
): DefaultTheme.NavItem[] {
  return nodes.map((node) => {
    const common = { text: resolveText(node.key, text, fallback), activeMatch: node.activeMatch?.replace(/^\^\//, `^${prefix}`) }
    if (node.items) {
      if (node.link || depth >= 2)
        throw new Error(`导航分组无效或超过默认主题支持的层级: ${node.key}`)
      return {
        ...common,
        items: resolveNav(node.items, text, fallback, prefix, depth + 1) as DefaultTheme.NavItemWithChildren['items'],
      }
    }
    if (!node.link)
      throw new Error(`导航项没有链接: ${node.key}`)
    return { ...common, link: resolveLink(node.link, prefix) }
  })
}

export function filterMenu(nodes: readonly MenuNode[], language: string): MenuNode[] {
  return nodes.filter(node => !node.languages || node.languages.includes(language))
    .map(node => ({ ...node, ...(node.items ? { items: filterMenu(node.items, language) } : {}) }))
    .filter(node => node.link || node.items?.length)
}

export function resolveSidebar(
  nodes: readonly MenuNode[],
  text: Record<string, string>,
  fallback: Record<string, string>,
  prefix: string,
): DefaultTheme.SidebarItem[] {
  return nodes.map(node => ({
    text: resolveText(node.key, text, fallback),
    ...(node.link ? { link: resolveLink(node.link, prefix) } : {}),
    ...(node.items ? { items: resolveSidebar(node.items, text, fallback, prefix) } : {}),
    ...(node.collapsed !== undefined ? { collapsed: node.collapsed } : {}),
  }))
}

export function resolveSidebars(
  sections: readonly SidebarSection[],
  text: Record<string, string>,
  fallback: Record<string, string>,
  prefix: string,
): SidebarMap {
  return Object.fromEntries([...sections].sort((a, b) => b.prefix.length - a.prefix.length).map(section => [
    resolvePath(section.prefix, prefix),
    resolveSidebar(section.items, text, fallback, prefix),
  ]))
}
