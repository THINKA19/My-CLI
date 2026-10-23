import { test, expect } from '@playwright/test'

test('selected UI button works', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('初始化完成')
  await expect(page.getByRole('status')).toHaveText('点击次数：0')
  await page.getByRole('button', { name: '点击体验' }).click()
  await expect(page.getByRole('status')).toHaveText('点击次数：1')
})
