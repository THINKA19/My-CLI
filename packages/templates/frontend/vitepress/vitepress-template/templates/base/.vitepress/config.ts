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

// 国际化配置：多语言标签与链接配置
import { languageConfig } from '#config/language'
// 搜索引擎配置：本地 MiniSearch 检索参数与多语言搜索文案
import { searchConfig } from '#config/search'
import { seoConfig, transformHead } from '#config/seo'
// 基础站点配置：维护 base、源码与输出目录及构建设置；标题、描述和语言由各语言配置提供
import { siteConfig } from '#config/site'
// 与语言无关的公共主题设置
import { themeConfig } from '#config/theme'

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
  head: seoConfig,
  transformHead,

  // 国际化配置
  ...languageConfig,

  // 主题与 UI 层配置（全局共享配置，如搜索）
  themeConfig: {
    ...themeConfig,
    // 本地搜索配置
    search: searchConfig,
  },

})
