import type { App } from 'vue'
import { environment } from '@/shared/config/env'

export interface Diagnostic {
  source: 'vue' | 'window' | 'promise' | 'manual'
  message: string
  release: string
  time: string
}
export function sanitizeMessage(value: unknown) {
  const message = value instanceof Error ? value.message : typeof value === 'string' ? value : 'Unknown error'
  return message
    .replace(/https?:\/\/[^\s]+/gi, '[url]')
    .replace(/\bBearer\s+[A-Za-z0-9._~+/-]+=*/gi, 'Bearer [redacted]')
    .replace(/(["']?(?:token|password|authorization|secret|cookie)["']?)\s*[:=]\s*(?:"[^"]*"|'[^']*'|[^\s,;}]+)/gi, '$1=[redacted]')
    .slice(0, 300)
}
type DiagnosticReporter = (event: Diagnostic) => void | Promise<void>
let reporter: DiagnosticReporter = event => { if (import.meta.env.DEV) console.error('[diagnostic]', event) }
export function setDiagnosticReporter(next: DiagnosticReporter) { reporter = next }
export function reportError(error: unknown, source: Diagnostic['source'] = 'manual') {
  const event: Diagnostic = { source, message: sanitizeMessage(error), release: environment.release, time: new Date().toISOString() }
  try { void Promise.resolve(reporter(event)).catch(() => {}) } catch { /* Reporting must not break the application. */ }
  return event
}
export function install(app: App) {
  const previous = app.config.errorHandler
  const handler: NonNullable<typeof app.config.errorHandler> = (error, instance, info) => {
    reportError(error, 'vue')
    previous?.(error, instance, info)
  }
  app.config.errorHandler = handler
  const onError = (event: ErrorEvent) => reportError(event.error || event.message, 'window')
  const onRejection = (event: PromiseRejectionEvent) => reportError(event.reason, 'promise')
  window.addEventListener('error', onError)
  window.addEventListener('unhandledrejection', onRejection)
  app.onUnmount(() => {
    window.removeEventListener('error', onError)
    window.removeEventListener('unhandledrejection', onRejection)
    app.config.errorHandler = previous
  })
}
