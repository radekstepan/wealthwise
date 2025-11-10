import { test, expect } from '@playwright/test';

// Core inputs + loading + rough result change

test.describe('Wealthwise Simulator - core inputs', () => {
  test('changing key inputs triggers loading and updates results', async ({ page }) => {
    await page.goto('/run');

    await expect(page.getByRole('heading', { name: /buy vs rent net worth comparison/i })).toBeVisible();

    const chart = page.locator('.chart');
    const resultCell = page.locator('.table .item.bold').first();

    const initial = (await resultCell.innerText()).trim();
    expect(initial).toContain('$');

    // Change just the property price to trigger recalculation
    await page.getByPlaceholder('Property price').fill('$900,000');
    await page.getByPlaceholder('Property price').blur();

    await expect(chart).toHaveClass(/is-loading/);
    await expect(chart).not.toHaveClass(/is-loading/, { timeout: 20000 });

    const updated = (await resultCell.innerText()).trim();
    expect(updated).toContain('$');
    expect(updated).not.toBe(initial);
  });
});
