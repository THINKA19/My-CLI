import { publicUrl } from '@/shared/config/env'
import { client } from './client'

export interface ExampleData { message: string }

export function createExampleRequest() {
  const controller = new AbortController()
  return {
    send: async (): Promise<ExampleData> => (await client.get<ExampleData>(publicUrl('mock/hello.json'), { signal: controller.signal })).data,
    cancel: () => controller.abort(),
  }
}
export async function getExample(): Promise<ExampleData> {
  return createExampleRequest().send()
}
