import { test, expect } from '@playwright/test';

test.describe('Charts Loading and Updates', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the simulator page
    await page.goto('/run');
    // Wait for the page to fully load
    await expect(page.getByRole('heading', { name: 'Buy vs rent net worth comparison' })).toBeVisible();
  });

  test('should load all three charts and update when inputs change', async ({ page }) => {
    // 1. Verify Net Worth chart (trajectory tab) is loaded
    await expect(page.getByRole('tab', { name: 'Net worth over time' })).toBeVisible();
    const netWorthTab = page.getByRole('tab', { name: 'Net worth over time' });
    await netWorthTab.click();
    
    // Check that the chart container exists and has loaded
    const netWorthChart = page.locator('.chart').first();
    await expect(netWorthChart).toBeVisible();
    
    // Wait for initial loading to complete (chart should not have loading class)
    await expect(netWorthChart).not.toHaveClass(/is-loading/, { timeout: 20000 });
    
    // Verify chart has SVG content
    await expect(netWorthChart.locator('svg')).toBeVisible();
    const netWorthPaths = netWorthChart.locator('svg path');
    await expect(await netWorthPaths.count()).toBeGreaterThan(0);

    // 2. Verify Distribution chart loads
    const distributionTab = page.getByRole('tab', { name: 'Distribution' });
    await distributionTab.click();
    
    const distributionChart = page.locator('.distribution');
    await expect(distributionChart).toBeVisible();
    
    // Wait for distribution chart to load
    await expect(distributionChart).not.toHaveClass(/is-loading/, { timeout: 20000 });
    
    // Verify distribution chart has SVG content
    await expect(distributionChart.locator('svg')).toBeVisible();
    const distributionPaths = distributionChart.locator('svg path.area');
    await expect(await distributionPaths.count()).toBeGreaterThan(0);

    // 3. Verify Key Factors chart loads
    const keyFactorsTab = page.getByRole('tab', { name: 'Key factors' });
    await keyFactorsTab.click();
    
    const keyFactorsChart = page.locator('.key-factors-chart');
    await expect(keyFactorsChart).toBeVisible();
    
    // Key factors might show placeholder if no ranges are set, but it should still load
    await expect(keyFactorsChart).not.toHaveClass(/is-loading/, { timeout: 20000 });

    // 4. Test updating inputs and verify charts update with loading states
    
    // Go back to Net Worth chart for input testing
    await netWorthTab.click();
    
    // Get initial chart state for comparison
    const initialChartPaths = await netWorthChart.locator('svg path').all();
    const initialPathData = await Promise.all(
      initialChartPaths.map(path => path.getAttribute('d'))
    );

    // Find and interact with Property price input
    const priceInput = page.getByRole('textbox', { name: 'Property price' });
    await expect(priceInput).toBeVisible();
    
    // Change the property price to trigger recalculation
    await priceInput.fill('$900,000');
    await priceInput.blur(); // Trigger the onBlur event

    // 5. Verify loading states appear
    
    // Net Worth chart should show loading state
    await expect(netWorthChart).toHaveClass(/is-loading/);
    
    // Check for loading toast/message
    const loadingToast = netWorthChart.locator('.chart-loading-toast');
    await expect(loadingToast).toBeVisible();
    // Verify loading toast contains loading text
    await expect(loadingToast).toContainText('Loading');

    // 6. Wait for charts to complete loading
    await expect(netWorthChart).not.toHaveClass(/is-loading/, { timeout: 20000 });
    await expect(loadingToast).not.toBeVisible();

    // 7. Verify chart data has updated
    const updatedChartPaths = await netWorthChart.locator('svg path').all();
    const updatedPathData = await Promise.all(
      updatedChartPaths.map(path => path.getAttribute('d'))
    );
    
    // At least some paths should have different data after the update
    expect(updatedPathData.some((data, index) => data !== initialPathData[index])).toBeTruthy();

    // 8. Test Distribution chart update
    await distributionTab.click();
    
    // Distribution should also update after input change
    // It might briefly show loading state
    await expect(distributionChart).not.toHaveClass(/is-loading/, { timeout: 20000 });
    
    // Verify distribution chart has updated content
    await expect(distributionChart.locator('svg')).toBeVisible();
    const updatedDistributionPaths = distributionChart.locator('svg path.area');
    await expect(await updatedDistributionPaths.count()).toBeGreaterThan(0);

    // 9. Test Key Factors chart update
    await keyFactorsTab.click();
    
    // Key factors should also update
    await expect(keyFactorsChart).not.toHaveClass(/is-loading/, { timeout: 20000 });

    // 10. Test another input change to verify consistent loading behavior
    
    // Go back to Net Worth chart
    await netWorthTab.click();
    
    // Change property price again to test another update
    await priceInput.fill('$1,100,000');
    await priceInput.blur();

    // Verify loading state again
    await expect(netWorthChart).toHaveClass(/is-loading/);
    await expect(netWorthChart.locator('.chart-loading-toast')).toBeVisible();
    
    // Wait for completion
    await expect(netWorthChart).not.toHaveClass(/is-loading/, { timeout: 20000 });
    await expect(netWorthChart.locator('.chart-loading-toast')).not.toBeVisible();

    // 11. Verify all three tabs are still functional after updates
    await distributionTab.click();
    await expect(distributionChart).toBeVisible();
    await expect(distributionChart).not.toHaveClass(/is-loading/);
    
    await keyFactorsTab.click();
    await expect(keyFactorsChart).toBeVisible();
    await expect(keyFactorsChart).not.toHaveClass(/is-loading/);
    
    await netWorthTab.click();
    await expect(netWorthChart).toBeVisible();
    await expect(netWorthChart).not.toHaveClass(/is-loading/);
  });

  test('should show loading messages and overlays correctly', async ({ page }) => {
    // Start with Net Worth chart
    await page.getByRole('tab', { name: 'Net worth over time' }).click();
    const netWorthChart = page.locator('.chart').first();
    
    // Wait for initial load to complete
    await expect(netWorthChart).not.toHaveClass(/is-loading/, { timeout: 20000 });

    // Change input to trigger loading
    const priceInput = page.getByRole('textbox', { name: 'Property price' });
    await priceInput.fill('$1,500,000');
    await priceInput.blur();

    // Verify loading overlay is present
    await expect(netWorthChart.locator('.chart-loader-overlay')).toBeVisible();
    
    // Verify loading toast appears with loading text
    const loadingToast = netWorthChart.locator('.chart-loading-toast');
    await expect(loadingToast).toBeVisible();
    await expect(loadingToast).toContainText('Loading');
    
    // Wait for loading to complete
    await expect(netWorthChart).not.toHaveClass(/is-loading/, { timeout: 20000 });
    
    // Verify loading elements are hidden
    await expect(loadingToast).not.toBeVisible();

    // Test Distribution chart loading
    await page.getByRole('tab', { name: 'Distribution' }).click();
    const distributionChart = page.locator('.distribution');
    
    // Change input again to trigger distribution loading
    await priceInput.fill('$1,200,000');
    await priceInput.blur();
    
    // Go back to distribution tab
    await page.getByRole('tab', { name: 'Distribution' }).click();
    
    // Distribution should show loading state
    await expect(distributionChart).toHaveClass(/is-loading/);
    await expect(distributionChart.locator('.distribution__toast')).toBeVisible();
    await expect(distributionChart.locator('.distribution__overlay')).toBeVisible();
    
    // Wait for completion
    await expect(distributionChart).not.toHaveClass(/is-loading/, { timeout: 20000 });

    // Test Key Factors loading
    await page.getByRole('tab', { name: 'Key factors' }).click();
    const keyFactorsChart = page.locator('.key-factors-chart');
    
    // Change input to trigger key factors loading
    await priceInput.fill('$800,000');
    await priceInput.blur();
    
    // Go back to key factors tab
    await page.getByRole('tab', { name: 'Key factors' }).click();
    
    // Key factors should show loading state
    await expect(keyFactorsChart).toHaveClass(/is-loading/);
    await expect(keyFactorsChart.locator('.key-factors-chart__toast')).toBeVisible();
    await expect(keyFactorsChart.locator('.key-factors-chart__overlay')).toBeVisible();
    
    // Wait for completion
    await expect(keyFactorsChart).not.toHaveClass(/is-loading/, { timeout: 20000 });
  });

  test('should handle rapid input changes gracefully', async ({ page }) => {
    // Start with Net Worth chart
    await page.getByRole('tab', { name: 'Net worth over time' }).click();
    const netWorthChart = page.locator('.chart').first();
    
    // Wait for initial load
    await expect(netWorthChart).not.toHaveClass(/is-loading/, { timeout: 20000 });

    const priceInput = page.getByRole('textbox', { name: 'Property price' });
    
    // Make rapid changes to test debouncing and graceful handling
    const values = ['$700,000', '$850,000', '$950,000', '$1,100,000'];
    
    for (const value of values) {
      await priceInput.fill(value);
      await priceInput.blur();
      // Small delay to simulate user interaction
      await page.waitForTimeout(100);
    }

    // Should eventually settle and not be loading
    await expect(netWorthChart).not.toHaveClass(/is-loading/, { timeout: 30000 });
    
    // Chart should be functional with final data
    await expect(netWorthChart.locator('svg')).toBeVisible();
    const finalPaths = netWorthChart.locator('svg path');
    await expect(await finalPaths.count()).toBeGreaterThan(0);

    // Verify other charts also handle the changes
    await page.getByRole('tab', { name: 'Distribution' }).click();
    const distributionChart = page.locator('.distribution');
    await expect(distributionChart).not.toHaveClass(/is-loading/, { timeout: 20000 });
    
    await page.getByRole('tab', { name: 'Key factors' }).click();
    const keyFactorsChart = page.locator('.key-factors-chart');
    await expect(keyFactorsChart).not.toHaveClass(/is-loading/, { timeout: 20000 });
  });
});