import { defineConfig, devices } from '@playwright/test';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './spec',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'list',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Run in headed mode locally */
    headless: !!process.env.CI,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:8080',
        launchOptions: {
          // args: ['--auto-open-devtools-for-tabs'],
          ignoreDefaultArgs: ['--hide-scrollbars'],
        }
      },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'yarn start',
    port: 8080,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
