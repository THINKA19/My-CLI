import { createApp } from 'vue'
import { expect, it, vi } from 'vitest'
import { install, reportError, sanitizeMessage, setDiagnosticReporter } from '../setup'
it('redacts diagnostics, contains reporter failures and releases listeners', () => {
  expect(sanitizeMessage('token=abc https://example.com/user?secret=123')).toBe('token=[redacted] [url]')
  expect(sanitizeMessage('{"token":"private"}')).not.toContain('private')
  expect(sanitizeMessage('Authorization: Bearer abc.def')).not.toContain('abc.def')
  const reporter = vi.fn()
  setDiagnosticReporter(reporter)
  const app = createApp({ render: () => null })
  install(app)
  app.mount(document.createElement('div'))
  window.dispatchEvent(new ErrorEvent('error', { message: 'password=123' }))
  expect(reporter.mock.calls[0]?.[0].message).toBe('password=[redacted]')
  app.unmount()
  reporter.mockClear()
  window.dispatchEvent(new ErrorEvent('error', { message: 'after unmount' }))
  expect(reporter).not.toHaveBeenCalled()
  setDiagnosticReporter(() => { throw new Error('reporter failed') })
  expect(() => reportError('test')).not.toThrow()
})

it('contains asynchronous reporter rejection', async () => {
  const reporter = vi.fn(async () => { throw new Error('async reporter failed') })
  setDiagnosticReporter(reporter)
  expect(() => reportError('async test')).not.toThrow()
  await new Promise(resolve => setTimeout(resolve, 0))
  expect(reporter).toHaveBeenCalledOnce()
})
