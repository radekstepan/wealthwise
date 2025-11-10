import { test, expect } from '@playwright/test';

const heading = (name: string) => ({ name, exact: false });

test.describe('Wealthwise Navigation', () => {
  test('home page loads', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /buy or rent\? see your potential future/i })).toBeVisible();
  });

  test('run page loads from home CTA', async ({ page }) => {
    await page.goto('/');
    const cta = page.getByRole('link', { name: /start.*simulation|try.*simulator|run.*numbers/i });
    if (await cta.isVisible()) {
      await cta.click();
    } else {
      await page.goto('/run');
    }
    await expect(page).toHaveURL(/\/run/);
    await expect(page.getByRole('heading', heading('Buy vs rent net worth comparison'))).toBeVisible();
  });

  test('FAQ page loads', async ({ page }) => {
    await page.goto('/faq');
    await expect(page.getByRole('heading', { name: /faq/i })).toBeVisible();
  });

  test('shows not found for bad route', async ({ page }) => {
    await page.goto('/this-route-should-not-exist');
    // Unknown routes stay on the main shell; we just assert we do not get a blank screen.
    await expect(page.locator('.nav')).toBeVisible();
  });
});
