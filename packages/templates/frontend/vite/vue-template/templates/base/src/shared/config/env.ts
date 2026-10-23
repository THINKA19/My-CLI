import { readEnvironment } from './validate'

export const environment = readEnvironment(import.meta.env)

export function publicUrl(path: string) {
  const origin = globalThis.location?.origin || 'http://localhost'
  return new URL(path.replace(/^\//, ''), new URL(import.meta.env.BASE_URL, origin)).href
}
