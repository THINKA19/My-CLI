import { createAlova } from 'alova'
import adapterFetch from 'alova/fetch'

export const client = createAlova({
  baseURL: import.meta.env.BASE_URL,
  timeout: 10000,
  requestAdapter: adapterFetch(),
  cacheFor: { GET: 0 },
  responded: async (response) => {
    if (!response.ok)
      throw new Error(`HTTP ${response.status}`)
    return response.json()
  },
})
