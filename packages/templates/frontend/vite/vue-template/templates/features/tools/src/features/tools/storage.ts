export function createStorage(namespace: string, storage?: Storage) {
  const target = () => storage || globalThis.localStorage
  return {
    get<T>(key: string, validate: (value: unknown) => value is T): T | undefined {
      try {
        const raw = target().getItem(namespace + ':' + key)
        if (raw === null) return undefined
        const value: unknown = JSON.parse(raw)
        return validate(value) ? value : undefined
      } catch { return undefined }
    },
    set(key: string, value: unknown) {
      try {
        const encoded = JSON.stringify(value)
        if (encoded === undefined) return false
        target().setItem(namespace + ':' + key, encoded)
        return true
      } catch { return false }
    },
    remove(key: string) {
      try { target().removeItem(namespace + ':' + key); return true } catch { return false }
    },
  }
}
