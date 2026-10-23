import { publicUrl } from '@/shared/config/env'
import { client } from './client'

export interface ExampleData { message: string }

export function createExampleRequest() {
  const method = client.Get<ExampleData>(publicUrl('mock/hello.json'))
  return { send: () => method.send(), cancel: () => method.abort() }
}
export async function getExample(): Promise<ExampleData> {
  return createExampleRequest().send()
}
