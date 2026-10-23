// @vitest-environment node
import { expect, it } from 'vitest'
import { createEnvironment } from '../environment'
it('validates deployment base and only creates an explicitly configured dev proxy', () => {
  expect(createEnvironment({}).proxy).toBeUndefined()
  expect(createEnvironment({ VITE_APP_BASE: '/app/', DEV_PROXY_TARGET: 'http://127.0.0.1:8080' })).toEqual({ base: '/app/', proxy: { '/api': { target: 'http://127.0.0.1:8080', changeOrigin: true } } })
  expect(() => createEnvironment({ VITE_APP_BASE: '//invalid/' })).toThrow()
  expect(() => createEnvironment({ VITE_APP_BASE: '/app' })).toThrow()
  expect(() => createEnvironment({ DEV_PROXY_TARGET: 'file:///tmp' })).toThrow()
})
