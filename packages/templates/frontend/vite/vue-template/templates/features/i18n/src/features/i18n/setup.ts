import { watch } from 'vue'
import type { App } from 'vue'
import { createI18n } from 'vue-i18n'

export const i18n = createI18n({
  legacy: false,
  locale: 'zh-CN',
  fallbackLocale: 'en-US',
  messages: {
    'zh-CN': { greeting: '你好，开发者', language: '语言', title: '国际化示例' },
    'en-US': { greeting: 'Hello, developer', language: 'Language', title: 'Internationalization' },
  },
  datetimeFormats: {
    'zh-CN': { short: { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' } },
    'en-US': { short: { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' } },
  },
  numberFormats: {
    'zh-CN': { decimal: { style: 'decimal', maximumFractionDigits: 2 } },
    'en-US': { decimal: { style: 'decimal', maximumFractionDigits: 2 } },
  },
})
export function install(app: App) {
  app.use(i18n)
  try {
    const stored = localStorage.getItem('app:locale')
    if (stored === 'zh-CN' || stored === 'en-US') i18n.global.locale.value = stored
  } catch { /* Optional persistence. */ }
  const stop = watch(i18n.global.locale, locale => {
    document.documentElement.lang = locale
    try { localStorage.setItem('app:locale', locale) } catch { /* Optional persistence. */ }
  }, { immediate: true })
  app.onUnmount(stop)
}
