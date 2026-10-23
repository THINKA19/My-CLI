import { client } from './client'

export interface ExampleData {
  message: string
}

export async function getExample(): Promise<ExampleData> {
  return await client.Get<ExampleData>('mock/hello.json')
}
