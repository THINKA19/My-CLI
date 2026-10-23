import { flushPromises, mount } from '@vue/test-utils'
import { expect, it, vi } from 'vitest'
import HttpDemo from '@/app/components/HttpDemo.vue'
import { createExampleRequest } from '@/http/example'

vi.mock('@/http/example', () => ({ createExampleRequest: vi.fn() }))

it('shows loading, errors, and successful retries', async () => {
  let rejectRequest!: (reason: Error) => void
  vi.mocked(createExampleRequest).mockReturnValueOnce({ send: () => new Promise((_, reject) => { rejectRequest = reject }), cancel: vi.fn() })
  const wrapper = mount(HttpDemo)
  await wrapper.get('button').trigger('click')
  expect(wrapper.get('button').attributes('disabled')).toBeDefined()
  expect(wrapper.text()).toContain('请求中')
  rejectRequest(new Error('服务不可用'))
  await flushPromises()
  expect(wrapper.get('[role="alert"]').text()).toContain('服务不可用')
  expect(wrapper.get('button').attributes('disabled')).toBeUndefined()
  vi.mocked(createExampleRequest).mockReturnValueOnce({ send: async () => ({ message: '本地 Mock 请求成功' }), cancel: vi.fn() })
  await wrapper.get('button').trigger('click')
  await flushPromises()
  expect(wrapper.find('[role="alert"]').exists()).toBe(false)
  expect(wrapper.get('[role="status"]').text()).toBe('本地 Mock 请求成功')
  wrapper.unmount()
})

it('cancels a pending request on unmount', async () => {
  const cancel = vi.fn()
  vi.mocked(createExampleRequest).mockReturnValueOnce({ send: () => new Promise(() => {}), cancel })
  const wrapper = mount(HttpDemo)
  await wrapper.get('button').trigger('click')
  wrapper.unmount()
  expect(cancel).toHaveBeenCalledOnce()
})
