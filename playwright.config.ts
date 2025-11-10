import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for InvoiceMe
 * 
 * This configuration follows production-ready patterns:
 * - Environment-based configuration
 * - Standardized timeouts (action 15s, navigation 30s, expect 10s, test 60s)
 * - Failure-only artifact capture (screenshots, videos, traces)
 * - HTML + JUnit reporters for CI integration
 * - Parallel execution enabled
 */
export default defineConfig({
  // Test directory - includes both e2e and performance tests
  testDir: './tests',
  
  // Fully parallel execution within test files
  fullyParallel: true,
  
  // Prevent accidentally committed .only() from blocking CI
  forbidOnly: !!process.env.CI,
  
  // Retry failed tests in CI
  retries: process.env.CI ? 2 : 0,
  
  // Worker configuration: 1 in CI for stability, N-1 CPUs locally for speed
  workers: process.env.CI ? 1 : undefined,
  
  // Global test timeout: 60 seconds
  timeout: 60 * 1000,
  
  // Expect timeout: 10 seconds (all assertions)
  expect: {
    timeout: 15 * 1000, // 15s for assertions
  },
  
  // Global settings for all tests
  use: {
    // Base URL for all tests
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    
    // Action timeout: 15 seconds (click, fill, etc.)
    actionTimeout: 15 * 1000,
    
    // Navigation timeout: 30 seconds (page.goto, page.reload)
    navigationTimeout: 30 * 1000,
    
    // Trace recording: on first retry (best debugging data)
    trace: 'on-first-retry',
    
    // Screenshot: only on failure (saves space)
    screenshot: 'only-on-failure',
    
    // Video: retain on failure (delete on success)
    video: 'retain-on-failure',
  },
  
  // Reporters: HTML (visual), JUnit (CI), List (console)
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['junit', { outputFile: 'test-results/results.xml' }],
    ['list'],
  ],
  
  // Output directory for test artifacts
  outputDir: 'test-results',
  
  // Projects: Run tests across multiple browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Uncomment for cross-browser testing:
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],
  
  // Web server configuration (if needed for local development)
  // Uncomment if you want Playwright to start your Next.js dev server:
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000/customers',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },

  // Global setup: Create test user before all tests
  globalSetup: require.resolve('./tests/global-setup.ts'),
});


