// root 是 VitePress 的默认语言标识；页面仍使用 prefix，不做路径重写。
export const languages = {
  zh: { configKey: 'root', label: '简体中文', lang: 'zh-CN', prefix: '/zh/', sourceDir: 'zh', fallback: 'zh' },
  en: { configKey: 'en', label: 'English', lang: 'en-US', prefix: '/en/', sourceDir: 'en', fallback: 'zh' },
  vi: { configKey: 'vi', label: 'Tiếng Việt', lang: 'vi-VN', prefix: '/vi/', sourceDir: 'vi', fallback: 'zh' },
} as const
