import { defineConfig } from '@playwright/test';

/**
 * Playwright Configuration for API Tests
 * 
 * Separate config for API tests that don't need browser context
 */
export default defineConfig({
  // Test directory for API tests
  testDir: './tests/api',
  
  // Fully parallel execution
  fullyParallel: true,
  
  // Retry failed tests in CI
  retries: process.env.CI ? 2 : 0,
  
  // Worker configuration
  workers: process.env.CI ? 1 : undefined,
  
  // Global test timeout: 30 seconds (API tests are faster)
  timeout: 30 * 1000,
  
  // Expect timeout: 10 seconds
  expect: {
    timeout: 10 * 1000,
  },
  
  // Reporters
  reporter: [
    ['html', { outputFolder: 'playwright-report-api', open: 'never' }],
    ['junit', { outputFile: 'test-results/api-results.xml' }],
    ['list'],
  ],
  
  // Output directory for test artifacts
  outputDir: 'test-results',
  
  // No browser projects needed for API tests
  projects: [
    {
      name: 'api',
    },
  ],
});



