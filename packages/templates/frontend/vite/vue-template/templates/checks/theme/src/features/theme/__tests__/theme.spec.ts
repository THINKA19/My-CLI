import { createApp, nextTick } from 'vue'
import { expect, it, vi } from 'vitest'
import { install, useTheme } from '../setup'
it('applies and persists theme preference, then cleans up', async () => {
  localStorage.clear()
  const media = Object.assign(new EventTarget(), { matches: true })
  vi.stubGlobal('matchMedia', () => media)
  const app = createApp({ render: () => null })
  install(app)
  app.mount(document.createElement('div'))
  expect(document.documentElement.dataset.theme).toBe('dark')
  useTheme().preference.value = 'light'
  await nextTick()
  expect(document.documentElement.dataset.theme).toBe('light')
  expect(localStorage.getItem('app:theme')).toBe('light')
  app.unmount()
})
