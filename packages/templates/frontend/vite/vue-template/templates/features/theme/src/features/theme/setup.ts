import { computed, ref, watch } from 'vue'
import type { App } from 'vue'
import './theme.css'

export type ThemePreference = 'light' | 'dark' | 'system'
const preference = ref<ThemePreference>('system')
const brandColor = ref('#2563eb')
const systemDark = ref(false)
const isDark = computed(() => preference.value === 'dark' || (preference.value === 'system' && systemDark.value))

export function useTheme() {
  return { preference, isDark, brandColor }
}
export function install(app: App) {
  const media = window.matchMedia('(prefers-color-scheme: dark)')
  try {
    const stored = localStorage.getItem('app:theme')
    if (stored === 'dark' || stored === 'light' || stored === 'system') preference.value = stored
  } catch { /* Storage can be unavailable in private contexts. */ }
  systemDark.value = media.matches
  const update = (event: MediaQueryListEvent) => { systemDark.value = event.matches }
  media.addEventListener('change', update)
  const stop = watch([preference, isDark, brandColor], () => {
    document.documentElement.dataset.theme = isDark.value ? 'dark' : 'light'
    document.documentElement.classList.toggle('dark', isDark.value)
    document.documentElement.setAttribute('theme-mode', isDark.value ? 'dark' : 'light')
    document.documentElement.style.setProperty('--app-brand', brandColor.value)
    try { localStorage.setItem('app:theme', preference.value) } catch { /* Optional persistence. */ }
  }, { immediate: true })
  app.onUnmount(() => { stop(); media.removeEventListener('change', update) })
}
