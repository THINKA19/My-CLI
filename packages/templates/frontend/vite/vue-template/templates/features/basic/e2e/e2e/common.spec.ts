import { test, expect } from '@playwright/test'

test('HTTP fixture, failure and retry', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: '请求 Mock 数据', exact: true }).click()
  await expect(page.getByText('本地 Mock 请求成功', { exact: true })).toBeVisible()
  await page.route('**/mock/hello.json', route => route.fulfill({ status: 500, contentType: 'application/json', body: '{}' }))
  await page.getByRole('button', { name: '请求 Mock 数据', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('HTTP 500')
  await page.unroute('**/mock/hello.json')
  await page.getByRole('button', { name: '请求 Mock 数据', exact: true }).click()
  await expect(page.getByText('本地 Mock 请求成功', { exact: true })).toBeVisible()
})
test('deep links show 404 and return home', async ({ page }) => {
  await page.goto('/missing/page')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('404')
  await expect(page).toHaveTitle(/页面未找到/)
  await page.getByRole('link', { name: '返回首页' }).click()
  await expect(page.getByRole('heading', { level: 1 })).toContainText('初始化完成')
})
