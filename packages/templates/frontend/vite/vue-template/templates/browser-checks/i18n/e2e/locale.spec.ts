import { test, expect } from '@playwright/test'
test('language survives a reload', async ({ page }) => {
  await page.goto('/')
  await page.getByLabel('语言', { exact: true }).selectOption('en-US')
  await expect(page.getByText('Hello, developer', { exact: true })).toBeVisible()
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('lang', 'en-US')
})
