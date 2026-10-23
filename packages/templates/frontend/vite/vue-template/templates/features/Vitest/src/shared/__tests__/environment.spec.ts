import { describe, expect, it } from 'vitest'
import { readEnvironment } from '../config/validate'
import { publicUrl } from '../config/env'
import { toHttpError, HttpError } from '@/http/errors'

describe('public environment', () => {
  it('validates invalid timeout, URL credentials and empty titles', () => {
    expect(() => readEnvironment({ VITE_HTTP_TIMEOUT: '-1' })).toThrow()
    expect(() => readEnvironment({ VITE_API_BASE_URL: 'https://user:pass@example.com' })).toThrow()
    expect(() => readEnvironment({ VITE_API_BASE_URL: '//example.com' })).toThrow()
    expect(() => readEnvironment({ VITE_APP_TITLE: '   ' })).toThrow()
    expect(publicUrl('mock/hello.json')).toContain('/mock/hello.json')
  })
  it('classifies errors without coupling to business response codes', () => {
    expect(toHttpError({ code: 'ERR_CANCELED' }).kind).toBe('cancelled')
    expect(toHttpError({ code: 'ECONNABORTED' }).kind).toBe('timeout')
    expect(toHttpError({ response: { status: 403 } }).status).toBe(403)
    expect(toHttpError(new TypeError('fetch failed')).kind).toBe('network')
    expect(toHttpError(new HttpError('http', 'HTTP 500', 500)).status).toBe(500)
  })
})
