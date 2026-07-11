import { test, expect } from '@playwright/test'

// Skip the first-run tour so tests exercise the product, not the overlay.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('astera:onboarded', '1'))
  const errors = []
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  page.on('pageerror', (e) => errors.push(String(e)))
  page._asteraErrors = errors
})

test('landing page renders and links into the app', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText(/better/i)
  await page.getByRole('link', { name: /open app/i }).first().click()
  await expect(page).toHaveURL(/\/app/)
})

test('workspace renders the intelligence graph', async ({ page }) => {
  await page.goto('/app')
  await expect(page.getByText('Every meeting, as a living graph.')).toBeVisible()
  // custom React Flow nodes exist
  await expect(page.locator('.react-flow__node').first()).toBeVisible()
  await expect(page.locator('.react-flow__node')).toHaveCount(10)
})

test('a report reveals its cover, then shows summary and Meeting DNA', async ({ page }) => {
  await page.goto('/app/report/board-fy26')
  // Enter the report via the cover CTA (falls back to the auto-reveal).
  await page.getByRole('button', { name: 'Open report' }).click({ timeout: 3000 }).catch(() => {})
  await page.waitForTimeout(4500) // let the cover finish revealing if it auto-plays
  await expect(page.getByRole('heading', { name: /Board Meeting/i }).first()).toBeVisible()
  await expect(page.getByText('Generated with ASTRA')).toBeVisible()
  // The DNA section reveals on scroll (whileInView), so bring it into view first.
  const dna = page.getByText('Every meeting has a fingerprint.')
  await dna.scrollIntoViewIfNeeded()
  await expect(dna).toBeVisible()
  await expect(page.locator('svg polygon[fill^="url"]').first()).toBeVisible()
})

test('command palette opens and navigates', async ({ page }) => {
  await page.goto('/app')
  await page.getByRole('button', { name: /open command palette/i }).click()
  const input = page.getByPlaceholder(/search meetings/i)
  await expect(input).toBeVisible()
  await input.fill('analyt') // top result is Analytics
  await input.press('Enter')
  await expect(page).toHaveURL(/\/app\/analytics/)
})

test('theme switching re-skins and persists', async ({ page }) => {
  await page.goto('/app/reports')
  await page.getByRole('button', { name: /change theme/i }).click()
  await page.getByRole('button', { name: /Royal/i }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'royal')
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'royal')
})

test('no console errors on the core journey', async ({ page }) => {
  await page.goto('/app')
  await page.waitForTimeout(1500)
  await page.goto('/app/analytics')
  await page.waitForTimeout(1000)
  const errors = (page._asteraErrors || []).filter((e) => !/favicon|fontshare|net::ERR/i.test(e))
  expect(errors).toEqual([])
})
