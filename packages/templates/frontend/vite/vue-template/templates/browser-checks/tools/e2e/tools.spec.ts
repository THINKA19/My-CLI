import { test, expect } from '@playwright/test'
test('debounced input updates the preview', async ({ page }) => {
  await page.goto('/')
  await page.getByLabel('防抖输入', { exact: true }).fill('hello')
  await expect(page.getByText('200ms 后的值：hello', { exact: true })).toBeVisible()
})
