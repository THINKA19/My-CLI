/**
 * VitePress 项目核心配置文件 (主入口)
 *
 * 【设计模式】：模块化解耦配置 (Modular Configuration Pattern)
 * 核心配置项已被拆分至 `./config/*` 独立模块，本文件仅作为"系统总线"进行组装与导出，
 * 以确保配置文件的单一职责 (SRP) 与高度可维护性。
 *
 * 【国际化支持】：支持中文、英文、越南语三种语言
 * 【Mermaid 支持】：支持在 Markdown 中绘制流程图、时序图等图表
 */

import { defineConfig } from 'vitepress'

// -----------------------------------------------------------------------------
// 1. 拆分模块导入 (Module Imports)
// -----------------------------------------------------------------------------

// 国际化配置：多语言标签与链接配置
import { localesConfig } from '#config/i18n/index'
// 搜索引擎配置：内置 Algolia DocSearch 或 本地 FlexSearch/MinSearch 检索参数
import { searchConfig } from '#config/search'
import { seoConfig, transformHead } from '#config/seo'
// 基础站点配置：包含 title, description, lang, base, srcDir 等全局静态元数据
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
 * - markdown: 配置 Markdown 解析器，支持 Mermaid 等扩展。
 */
export default defineConfig({
  // 站点基础信息
  ...siteConfig,
  head: seoConfig,
  transformHead,

  // 国际化配置
  locales: localesConfig,

  // 主题与 UI 层配置（全局共享配置，如搜索）
  themeConfig: {
    ...themeConfig,
    // 本地搜索配置
    search: searchConfig,
  },

  // Markdown 配置
  markdown: {
    // 配置 Mermaid 支持
    config: (md) => {
      // Mermaid 代码块将被包装在特殊的容器中，供前端渲染
      const fence = md.renderer.rules.fence!
      md.renderer.rules.fence = (...args) => {
        const [tokens, idx] = args
        const token = tokens[idx]
        const lang = token.info.trim()

        if (lang === 'mermaid') {
          return `<div class="mermaid-container"><pre class="mermaid">${md.utils.escapeHtml(token.content)}</pre></div>`
        }
        return fence(...args)
      }
    },
  },
})
