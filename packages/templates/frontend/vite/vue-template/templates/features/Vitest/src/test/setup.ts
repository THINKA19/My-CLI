import { vi } from 'vitest'
if (typeof window !== 'undefined' && !window.matchMedia) {
  vi.stubGlobal('matchMedia', (query: string) => Object.assign(new EventTarget(), {
    matches: false, media: query, onchange: null,
    addListener() {}, removeListener() {},
  }))
}
