import { client } from './client'

export interface ExampleData {
  message: string
}

export async function getExample(): Promise<ExampleData> {
  const response = await client.get<ExampleData>('mock/hello.json')
  return response.data
}
