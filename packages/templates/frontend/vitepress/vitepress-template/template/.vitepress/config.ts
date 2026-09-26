/**
 * VitePress 项目核心配置文件 (主入口)
 * 
 * 【设计模式】：模块化解耦配置 (Modular Configuration Pattern)
 * 核心配置项已被拆分至 `./config/*` 独立模块，本文件仅作为“系统总线”进行组装与导出，
 * 以确保配置文件的单一职责 (SRP) 与高度可维护性。
 */

import { defineConfig } from 'vitepress'

// -----------------------------------------------------------------------------
// 1. 拆分模块导入 (Module Imports)
// -----------------------------------------------------------------------------

// 基础站点配置：包含 title, description, lang, base, srcDir 等全局静态元数据
import { siteConfig } from './config/site'
// SEO 优化配置：包含 <head> 中的 meta 标签、Open Graph 协议、Favicon、外部资源预加载等
import { seoConfig } from './config/seo'
// 主题细节配置：包含 logo, footer, editLink, socialLinks, docFooter 等通用主题属性
import { themeConfig } from './config/theme'
// 路由与导航配置：顶部 Header 导航栏的菜单结构与下拉列表
import { navConfig } from './config/nav'
// 侧边栏配置：各路由章节下的文档目录树与展开/折叠规则
import { sidebarConfig } from './config/sidebar'
// 搜索引擎配置：内置 Algolia DocSearch 或 本地 FlexSearch/MinSearch 检索参数
import { searchConfig } from './config/search'


// -----------------------------------------------------------------------------
// 2. 配置导出 (Configuration Assembly)
// -----------------------------------------------------------------------------
/**
 * 利用 defineConfig 函数提供全量的 TypeScript 类型推导与智能补全。
 * 组合结构分层：
 * - 顶层属性 (Site-level Specs): 影响站点构建、HTML 生成与 SSR 行为。
 * - themeConfig (Theme-level Specs): 作用于 VitePress 默认主题 (Default Theme) 的渲染层。
 */
export default defineConfig({
  // 站点基础信息
  ...siteConfig,
  // SEO 与 Head 元数据
  head: seoConfig,
  // 主题与 UI 层配置
  themeConfig: {
    // 主题细节配置
    ...themeConfig,
    // 顶部导航栏
    nav: navConfig,
    // 侧边栏
    sidebar: sidebarConfig,
    // 本地搜索配置
    search: searchConfig
  }
})