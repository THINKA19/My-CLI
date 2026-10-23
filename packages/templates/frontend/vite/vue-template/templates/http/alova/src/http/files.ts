import { client, createClient } from './client'

// Method instances support .abort() and .send(); no multipart header is set manually.
export function createUpload(url: string, file: File) {
  const body = new FormData()
  body.append('file', file)
  return client.Post<unknown>(url, body)
}
export function createDownload(url: string) {
  return createClient(true).Get<Blob>(url)
}
