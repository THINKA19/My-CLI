import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import HomeView from '@/app/pages/HomeView.vue'

describe('UI starter', () => {
  it('renders the selected library and handles a button click', async () => {
    const wrapper = mount(HomeView)
    expect(wrapper.get('h1').text()).toContain('初始化完成')
    expect(wrapper.get('[role="status"]').text()).toBe('点击次数：0')
    await wrapper.get('main').get('[role="button"], button').trigger('click')
    expect(wrapper.get('[role="status"]').text()).toBe('点击次数：1')
    wrapper.unmount()
  })
})
