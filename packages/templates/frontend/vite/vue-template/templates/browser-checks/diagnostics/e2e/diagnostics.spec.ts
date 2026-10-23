import { test, expect } from '@playwright/test'
test('diagnostic example stays usable', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: '记录示例诊断' }).click()
  await expect(page.getByText('Diagnostic sample', { exact: true })).toBeVisible()
})
