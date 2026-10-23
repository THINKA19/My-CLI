import { readEnvironment } from '../src/shared/config/validate.ts'

export function createEnvironment(values: Record<string, string>) {
  readEnvironment(values)
  const base = values.VITE_APP_BASE || '/'
  if (!/^\/(?!\/)/.test(base) || !base.endsWith('/') || /[?#]/.test(base))
    throw new Error('VITE_APP_BASE must begin and end with /, for example / or /app/')
  const target = values.DEV_PROXY_TARGET
  if (target) {
    const url = new URL(target)
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password)
      throw new Error('DEV_PROXY_TARGET must be an HTTP(S) URL without credentials')
  }
  return {
    base,
    proxy: target ? { '/api': { target, changeOrigin: true } } : undefined,
  }
}
