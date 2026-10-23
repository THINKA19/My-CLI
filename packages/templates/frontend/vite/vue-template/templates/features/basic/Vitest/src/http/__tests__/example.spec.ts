// @vitest-environment node
import { createServer } from 'node:http'
import { afterAll, beforeAll, expect, it, vi } from 'vitest'

let status = 200
let delay = 0
let requests = 0
const paths: string[] = []
const server = createServer((request, response) => {
  requests++
  paths.push(request.url || '')
  setTimeout(() => {
    response.writeHead(status, { 'Content-Type': 'application/json' })
    response.end(JSON.stringify({ message: '本地 Mock 请求成功' }))
  }, delay)
})

beforeAll(async () => {
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
  const address = server.address()
  if (!address || typeof address === 'string') throw new Error('Missing server address')
  vi.stubEnv('BASE_URL', `http://127.0.0.1:${address.port}/nested/`)
})

afterAll(async () => {
  vi.unstubAllEnvs()
  await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()))
})

it('requests fresh data under the base path and recovers after an HTTP error', async () => {
  const { getExample } = await import('../example')
  expect(await getExample()).toEqual({ message: '本地 Mock 请求成功' })
  expect(await getExample()).toEqual({ message: '本地 Mock 请求成功' })
  expect(requests).toBe(2)
  status = 500
  await expect(getExample()).rejects.toThrow()
  status = 200
  expect(await getExample()).toEqual({ message: '本地 Mock 请求成功' })
  expect(paths).toEqual(Array(4).fill('/nested/mock/hello.json'))
})


it('cancels a pending request using the selected library', async () => {
  const { createExampleRequest } = await import('../example')
  delay = 100
  const request = createExampleRequest()
  const arrived = new Promise<void>(resolve => server.once('request', () => resolve()))
  const pending = request.send()
  await arrived
  request.cancel()
  await expect(pending).rejects.toMatchObject({ kind: 'cancelled' })
  delay = 0
})
