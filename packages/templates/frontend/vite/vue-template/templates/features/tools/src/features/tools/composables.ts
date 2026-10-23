import { onScopeDispose, ref } from 'vue'
import { debounce } from './timing'

export function useEventListener(target: EventTarget, event: string, listener: EventListener) {
  target.addEventListener(event, listener)
  const stop = () => target.removeEventListener(event, listener)
  onScopeDispose(stop)
  return stop
}
export function useDebouncedRef(initial = '', delay = 200) {
  const value = ref(initial)
  const set = debounce((next: string) => { value.value = next }, delay)
  onScopeDispose(set.cancel)
  return { value, set }
}
