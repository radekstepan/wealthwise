import { test, expect } from '@playwright/test';

// Tabs + results sync (rough visibility checks)

test.describe('Wealthwise Simulator - results tabs', () => {
  test('switching tabs shows corresponding panels', async ({ page }) => {
    await page.goto('/run');

    // Default tab: trajectory chart visible
    const chartPanel = page.locator('.results-tabs__panel').first();
    await expect(chartPanel).toBeVisible();

    // Distribution tab
    await page.getByRole('tab', { name: /distribution/i }).click();
    await expect(page.locator('.results-tabs__panel--active')).toContainText(/distribution/i);

    // Key factors tab (preview)
    await page.getByRole('tab', { name: /key factors/i }).click();
    await expect(page.locator('.results-tabs__panel--active')).toContainText(/key factors/i);
  });
});
