export function readEnvironment(values: Record<string, unknown>) {
  const title = String(values.VITE_APP_TITLE || 'Vue Starter').trim()
  const apiBase = String(values.VITE_API_BASE_URL || '/api').trim()
  const timeout = Number(values.VITE_HTTP_TIMEOUT || 10000)
  if (!title) throw new Error('VITE_APP_TITLE cannot be blank')
  if (!/^\/(?!\/)/.test(apiBase) && !/^https?:\/\//.test(apiBase))
    throw new Error('VITE_API_BASE_URL must be a root-relative path or HTTP(S) URL')
  if (/^https?:/.test(apiBase)) {
    const url = new URL(apiBase)
    if (url.username || url.password || url.search || url.hash) throw new Error('API URL cannot contain credentials, query or hash')
  } else if (/[?#]/.test(apiBase)) throw new Error('API path cannot contain query or hash')
  if (!Number.isFinite(timeout) || timeout <= 0) throw new Error('VITE_HTTP_TIMEOUT must be positive')
  return { title, apiBase, timeout, release: String(values.VITE_APP_VERSION || 'development') }
}
