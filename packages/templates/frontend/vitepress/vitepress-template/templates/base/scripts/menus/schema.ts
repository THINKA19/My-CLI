import type { MenuNode, SidebarSection } from '../../.vitepress/config/menu/types.ts'

export interface Options {
  enabled?: boolean
  text?: string
  order?: number
  parent?: string
  activeMatch?: string
  collapsed?: boolean
  linkToIndex?: boolean
  mode?: 'link' | 'dropdown'
}
export interface Metadata {
  id?: string
  sidebar?: Options
  nav?: Options
}
export interface Page {
  language: string
  relative: string
  route: string
  id: string
  title: string
  translate: boolean
  menu: Metadata
}
export interface Extra {
  id: string
  text: Record<string, string>
  order?: number
  parent?: string
  link?: string
  items?: Extra[]
}
export interface Input {
  codes: string[]
  primary: string
  pages: Page[]
  extras: Extra[]
}
export interface Bundle {
  nav: MenuNode[]
  sidebar: SidebarSection[]
  texts: Record<string, { nav: Record<string, string>, sidebar: Record<string, string> }>
}

export function metadata(value: unknown, file: string): Metadata {
  const fail = (message: string): never => {
    throw new Error(`${file}: ${message}`)
  }
  const object = (item: unknown): Record<string, unknown> => {
    if (!item || typeof item !== 'object' || Array.isArray(item))
      fail('menu 必须是对象')
    return item as Record<string, unknown>
  }
  const menu = value === undefined ? {} : object(value)
  for (const key of Object.keys(menu)) {
    if (!['id', 'nav', 'sidebar'].includes(key))
      fail(`未知 menu 字段: ${key}`)
  }
  if (menu.id !== undefined && (typeof menu.id !== 'string' || !/^[\w./-]+$/.test(menu.id)))
    fail('menu.id 必须是非空稳定标识')
  for (const kind of ['nav', 'sidebar']) {
    if (menu[kind] === undefined)
      continue
    const options = object(menu[kind])
    const allowed = kind === 'nav'
      ? ['enabled', 'text', 'order', 'parent', 'activeMatch', 'mode']
      : ['enabled', 'text', 'order', 'collapsed', 'linkToIndex']
    for (const [key, item] of Object.entries(options)) {
      if (!allowed.includes(key))
        fail(`未知 ${kind} 字段: ${key}`)
      if (['enabled', 'collapsed', 'linkToIndex'].includes(key) && typeof item !== 'boolean')
        fail(`${kind}.${key} 必须是布尔值`)
      if (key === 'order' && (typeof item !== 'number' || !Number.isFinite(item)))
        fail(`${kind}.order 必须是有限数字`)
      if (['text', 'parent', 'activeMatch'].includes(key) && (typeof item !== 'string' || !item.trim()))
        fail(`${kind}.${key} 必须是非空文字`)
      if (key === 'mode' && !['link', 'dropdown'].includes(String(item)))
        fail('nav.mode 必须是 link 或 dropdown')
      if (key === 'activeMatch') {
        if (!(item as string).startsWith('^/'))
          fail('nav.activeMatch 必须以 ^/ 开头，且不带语言前缀')
        // 各分支共用一个路径起点，无需在解析器中改写任意正则。
        if ((item as string).includes('|^'))
          fail('nav.activeMatch 多路径请使用 ^/(guide|api)/，不要重复根路径起点')
        // 只允许分组内部的分支；跳过转义和字符组，避免误判字面量 |。
        let depth = 0
        for (const token of (item as string).match(/\\.|\[(?:\\.|[^\]\\])*\]|[()|]/g) ?? []) {
          if (token === '(')
            depth++
          else if (token === ')')
            depth--
          else if (token === '|' && depth === 0)
            fail('nav.activeMatch 多路径请使用 ^/(guide|api)/，各分支必须共用根路径起点')
        }
        try {
          const pattern = new RegExp(item as string)
          pattern.test('')
        }
        catch { fail('nav.activeMatch 不是有效正则') }
      }
    }
  }
  return menu as Metadata
}
