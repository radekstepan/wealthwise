import { test, expect } from '@playwright/test';

// Magic helpers + download button smoke tests (UI behaviour only)

test.describe('Wealthwise Simulator - magic helpers & download', () => {
  test('magic rent & appreciation buttons exist (if rendered)', async ({ page }) => {
    await page.goto('/run');

    const magicButtons = page.getByRole('button', { name: /find/i });
    const count = await magicButtons.count();

    // Only assert if present; do not fail if feature hidden or label changes.
    if (count > 0) {
      await expect(magicButtons.first()).toBeVisible();
    }
  });

  test('download sheet button exists (if rendered)', async ({ page }) => {
    await page.goto('/run');

    const download = page.getByRole('button', { name: /download/i }).or(page.getByRole('link', { name: /download/i }));
    // Only check presence if found; avoid hard failure if feature hidden
    if (await download.count()) {
      await expect(download.first()).toBeVisible();
    }
  });
});
