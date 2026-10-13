import type { SidebarSection } from '../i18n/types'
import { demoSections } from './demo'

// 各分类独立匹配侧边栏，首页不显示文档菜单。
export const sidebarSections = [
  ...demoSections,
] as const satisfies readonly SidebarSection[]
