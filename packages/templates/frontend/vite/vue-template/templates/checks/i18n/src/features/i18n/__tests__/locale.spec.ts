import { createApp, nextTick } from 'vue'
import { expect, it } from 'vitest'
import { i18n, install } from '../setup'
it('switches messages, formats, document language and persistence', async () => {
  localStorage.clear()
  const app = createApp({ render: () => null })
  install(app)
  app.mount(document.createElement('div'))
  i18n.global.locale.value = 'en-US'
  await nextTick()
  expect(i18n.global.t('greeting')).toBe('Hello, developer')
  expect(i18n.global.n(1234.5, 'decimal')).toBe('1,234.5')
  expect(i18n.global.d(new Date('2026-01-01T00:00:00Z'), 'short')).toContain('2026')
  expect(document.documentElement.lang).toBe('en-US')
  expect(localStorage.getItem('app:locale')).toBe('en-US')
  app.unmount()
})
