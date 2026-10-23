import { createAlova } from 'alova'
import adapterFetch from 'alova/fetch'
import { environment } from '@/shared/config/env'
import { HttpError, toHttpError } from './errors'

export function createClient(binary = false) {
  return createAlova({
    baseURL: environment.apiBase,
    timeout: environment.timeout,
    requestAdapter: adapterFetch(),
    cacheFor: { GET: 0 },
    responded: {
      onSuccess: async (response) => {
        if (!response.ok) throw new HttpError('http', 'HTTP ' + response.status, response.status)
        if (binary) return response.blob()
        return response.status === 204 ? undefined : response.json()
      },
      onError: (error) => { throw toHttpError(error) },
    },
  })
}
export const client = createClient()
