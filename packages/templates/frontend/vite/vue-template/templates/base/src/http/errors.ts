export type HttpErrorKind = 'cancelled' | 'timeout' | 'http' | 'network' | 'unknown'
export class HttpError extends Error {
  constructor(public kind: HttpErrorKind, message: string, public status?: number) {
    super(message)
    this.name = 'HttpError'
  }
}
export function toHttpError(error: unknown): HttpError {
  if (error instanceof HttpError) return error
  const value = error as { name?: string; code?: string; message?: string; response?: { status?: number } } | null
  const message = value?.message || '请求失败'
  if (value?.name === 'AbortError' || value?.code === 'ERR_CANCELED' || /abort|cancel/i.test(message)) return new HttpError('cancelled', '请求已取消')
  if (value?.code === 'ECONNABORTED' || /timeout|timed out/i.test(message)) return new HttpError('timeout', '请求超时')
  if (value?.response?.status) return new HttpError('http', 'HTTP ' + value.response.status, value.response.status)
  if (value?.name === 'TypeError' || value?.code === 'ERR_NETWORK' || /network|fetch failed/i.test(message)) return new HttpError('network', '网络连接失败')
  return new HttpError('unknown', message)
}
