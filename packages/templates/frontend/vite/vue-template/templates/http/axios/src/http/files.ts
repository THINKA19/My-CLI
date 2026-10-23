import { client } from './client'

// Pass a real backend endpoint; the static Mock fixture only supports GET.
export async function uploadFile(url: string, file: File, signal?: AbortSignal) {
  const body = new FormData()
  body.append('file', file)
  return (await client.post<unknown>(url, body, { signal })).data
}
export async function downloadFile(url: string, signal?: AbortSignal): Promise<Blob> {
  return (await client.get<Blob>(url, { responseType: 'blob', signal })).data
}
