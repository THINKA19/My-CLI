import { effectScope } from 'vue'
import { afterEach, expect, it, vi } from 'vitest'
import { debounce, throttle } from '../timing'
import { createStorage } from '../storage'
import { useDebouncedRef, useEventListener } from '../composables'
afterEach(() => vi.useRealTimers())
it('debounces, cancels and throttles', () => {
  vi.useFakeTimers()
  const fn = vi.fn()
  const run = debounce(fn, 100)
  run(1); run(2)
  vi.advanceTimersByTime(100)
  expect(fn).toHaveBeenCalledExactlyOnceWith(2)
  run(3); run.cancel(); vi.advanceTimersByTime(100)
  expect(fn).toHaveBeenCalledTimes(1)
  const limited = throttle(fn, 100)
  limited(); limited()
  expect(fn).toHaveBeenCalledTimes(2)
})
it('validates stored values and releases scope resources', () => {
  const storage = createStorage('test')
  storage.set('value', 42)
  expect(storage.get('value', (value): value is number => typeof value === 'number')).toBe(42)
  expect(storage.get('value', (value): value is string => typeof value === 'string')).toBeUndefined()
  const scope = effectScope()
  const listener = vi.fn()
  const target = new EventTarget()
  vi.useFakeTimers()
  scope.run(() => { useEventListener(target, 'hello', listener); useDebouncedRef().set('test') })
  scope.stop()
  target.dispatchEvent(new Event('hello'))
  expect(listener).not.toHaveBeenCalled()
  expect(vi.getTimerCount()).toBe(0)
})

it('rejects values that cannot be serialized without corrupting existing storage', () => {
  const storage = createStorage('serialization')
  expect(storage.set('value', 42)).toBe(true)
  expect(storage.set('value', undefined)).toBe(false)
  expect(storage.set('value', () => {})).toBe(false)
  expect(storage.get('value', (value): value is number => typeof value === 'number')).toBe(42)
})
