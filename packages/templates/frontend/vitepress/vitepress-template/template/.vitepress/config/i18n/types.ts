import type { DefaultTheme } from 'vitepress'
import type { languages } from './registry'

export type Language = keyof typeof languages

export type LinkTarget
  = | { path: string, url?: never }
    | { url: string, path?: never }

export interface MenuNode {
  key: string
  link?: LinkTarget
  items?: readonly MenuNode[]
  collapsed?: boolean
  activeMatch?: string
}

type NodeKeys<Node> = Node extends { key: infer Key extends string }
  ? Key | (Node extends { items: infer Items extends readonly unknown[] } ? MenuKeys<Items> : never)
  : never

// 从每个栏目结构推导 key，不再维护另一份字符串清单。
export type MenuKeys<Nodes extends readonly unknown[]> = NodeKeys<Nodes[number]>
export type MenuText<Nodes extends readonly unknown[]> = Record<MenuKeys<Nodes>, string>

export interface SiteText {
  title: string
  titleTemplate: string
  description: string
}

export interface ThemeText {
  siteTitle: string
  outline: { label: string }
  footer: { message: string, copyright: string }
  editLink: { text: string }
  lastUpdated: { text: string }
  docFooter: { prev: string, next: string }
  darkModeSwitchLabel: string
  lightModeSwitchTitle: string
  darkModeSwitchTitle: string
  sidebarMenuLabel: string
  returnToTopLabel: string
  langMenuLabel: string
  notFound: { title: string, quote: string, linkLabel: string, linkText: string }
}

export interface SearchText {
  button: { buttonText: string, buttonAriaLabel: string }
  modal: {
    noResultsText: string
    resetButtonTitle: string
    displayDetails: string
    backButtonTitle: string
    footer: { selectText: string, navigateText: string, closeText: string }
  }
}

export interface SeoText {
  author: string
  keywords: string
  ogLocale: string
}

export interface LocaleText {
  site: SiteText
  theme: ThemeText
  seo: SeoText
  nav: Record<string, string>
  sidebar: Record<string, string>
  search: SearchText
}

export interface SidebarSection {
  id: string
  prefix: string
  items: readonly MenuNode[]
}

export type SidebarMap = Record<string, DefaultTheme.SidebarItem[]>
