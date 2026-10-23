import { test, expect } from '@playwright/test'
test('PC content fits a desktop viewport', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('初始化完成')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
})
