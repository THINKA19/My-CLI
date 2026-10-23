import { test, expect } from '@playwright/test'
test('theme survives a reload', async ({ page }) => {
  await page.goto('/')
  await page.getByLabel('外观', { exact: true }).selectOption('dark')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
})
