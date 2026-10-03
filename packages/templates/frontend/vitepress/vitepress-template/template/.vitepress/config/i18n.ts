/**
 * 国际化配置文件 (i18n Configuration)
 * 
 * 定义多语言支持的基础配置，包括语言标签、标题、描述等
 * 支持的语言：中文、英文、越南语
 */

import type { LocaleConfig } from 'vitepress'

/**
 * 多语言配置
 * - root: 简体中文（默认语言，映射到 zh 目录）
 * - en: 英文
 * - vi: 越南语
 */
export const localesConfig: LocaleConfig = {
  root: {
    label: '简体中文',
    lang: 'zh-CN',
    link: '/'
  },
  en: {
    label: 'English',
    lang: 'en-US',
    link: '/en/'
  },
  vi: {
    label: 'Tiếng Việt',
    lang: 'vi-VN',
    link: '/vi/'
  }
}
