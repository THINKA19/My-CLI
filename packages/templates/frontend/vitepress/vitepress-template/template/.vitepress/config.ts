/**
 * VitePress 项目核心配置文件 (主入口)
 * 
 * 【设计模式】：模块化解耦配置 (Modular Configuration Pattern)
 * 核心配置项已被拆分至 `./config/*` 独立模块，本文件仅作为"系统总线"进行组装与导出，
 * 以确保配置文件的单一职责 (SRP) 与高度可维护性。
 * 
 * 【国际化支持】：支持中文、英文、越南语三种语言
 */

import { defineConfig } from 'vitepress'

// -----------------------------------------------------------------------------
// 1. 拆分模块导入 (Module Imports)
// -----------------------------------------------------------------------------

// 基础站点配置：包含 title, description, lang, base, srcDir 等全局静态元数据
import { siteConfig } from './config/site'
// SEO 优化配置：包含 <head> 中的 meta 标签、Open Graph 协议、Favicon、外部资源预加载等
import { seoConfig } from './config/seo'
// 搜索引擎配置：内置 Algolia DocSearch 或 本地 FlexSearch/MinSearch 检索参数
import { searchConfig } from './config/search'
// 国际化配置：多语言标签与链接配置
import { localesConfig } from './config/i18n'
// 中文语言配置：中文站点的所有配置项
import { zhConfig } from './config/locales/zh'
// 英文语言配置：英文站点的所有配置项
import { enConfig } from './config/locales/en'
// 越南语语言配置：越南语站点的所有配置项
import { viConfig } from './config/locales/vi'


// -----------------------------------------------------------------------------
// 2. 配置导出 (Configuration Assembly)
// -----------------------------------------------------------------------------
/**
 * 利用 defineConfig 函数提供全量的 TypeScript 类型推导与智能补全。
 * 组合结构分层：
 * - 顶层属性 (Site-level Specs): 影响站点构建、HTML 生成与 SSR 行为。
 * - locales (i18n): 多语言配置，每个语言有独立的站点与主题配置。
 * - themeConfig (Theme-level Specs): 作用于 VitePress 默认主题 (Default Theme) 的渲染层。
 */
export default defineConfig({
  // 站点基础信息
  ...siteConfig,
  // SEO 与 Head 元数据
  head: seoConfig,
  
  // 国际化配置
  locales: {
    // 中文（默认语言，根路径）
    root: {
      label: localesConfig.root.label,
      lang: localesConfig.root.lang,
      link: localesConfig.root.link,
      ...zhConfig
    },
    // 英文
    en: {
      label: localesConfig.en.label,
      lang: localesConfig.en.lang,
      link: localesConfig.en.link,
      ...enConfig
    },
    // 越南语
    vi: {
      label: localesConfig.vi.label,
      lang: localesConfig.vi.lang,
      link: localesConfig.vi.link,
      ...viConfig
    }
  },

  // 主题与 UI 层配置（全局共享配置，如搜索）
  themeConfig: {
    // 本地搜索配置
    search: searchConfig
  }
})
