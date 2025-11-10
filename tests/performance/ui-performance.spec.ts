import { Page } from '@playwright/test';

/**
 * Base utilities for UI performance testing.
 * 
 * Provides common functionality for measuring UI performance:
 * - Page load time measurement
 * - Form submission time measurement
 * - Navigation transition time measurement
 * - Performance assertions for UI thresholds
 * 
 * Performance Thresholds (as per AC #6, #7, #8):
 * - Page Load: < 500ms (AC #6)
 * - Form Submission: < 1000ms (AC #7)
 * - Navigation: < 300ms (AC #8)
 */

/**
 * Performance thresholds for UI operations.
 */
export const UI_PERFORMANCE_THRESHOLDS = {
  PAGE_LOAD_MS: 500,      // AC #6: Page renders in under 500ms
  FORM_SUBMISSION_MS: 1000, // AC #7: Form submission completes in under 1000ms
  NAVIGATION_MS: 300,     // AC #8: Page transition completes in under 300ms
} as const;

/**
 * Performance measurement result.
 */
export interface PerformanceResult {
  duration: number;
  operation: string;
  passed: boolean;
  threshold: number;
}

/**
 * Measure page load time.
 * 
 * @param page Playwright page instance
 * @param url URL to navigate to
 * @returns Performance result with duration
 */
export async function measurePageLoadTime(
  page: Page,
  url: string
): Promise<PerformanceResult> {
  const startTime = performance.now();
  
  await page.goto(url);
  await page.waitForLoadState('networkidle');
  
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  return {
    duration,
    operation: `Page load: ${url}`,
    passed: duration < UI_PERFORMANCE_THRESHOLDS.PAGE_LOAD_MS,
    threshold: UI_PERFORMANCE_THRESHOLDS.PAGE_LOAD_MS,
  };
}

/**
 * Measure form submission time.
 * 
 * @param page Playwright page instance
 * @param submitAction Async function that performs the form submission
 * @returns Performance result with duration
 */
export async function measureFormSubmissionTime(
  page: Page,
  submitAction: () => Promise<void>
): Promise<PerformanceResult> {
  const startTime = performance.now();
  
  await submitAction();
  // Wait for network to be idle after submission
  await page.waitForLoadState('networkidle');
  
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  return {
    duration,
    operation: 'Form submission',
    passed: duration < UI_PERFORMANCE_THRESHOLDS.FORM_SUBMISSION_MS,
    threshold: UI_PERFORMANCE_THRESHOLDS.FORM_SUBMISSION_MS,
  };
}

/**
 * Measure navigation transition time.
 * 
 * @param page Playwright page instance
 * @param navigateAction Async function that performs the navigation
 * @returns Performance result with duration
 */
export async function measureNavigationTime(
  page: Page,
  navigateAction: () => Promise<void>
): Promise<PerformanceResult> {
  const startTime = performance.now();
  
  await navigateAction();
  await page.waitForLoadState('networkidle');
  
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  return {
    duration,
    operation: 'Navigation transition',
    passed: duration < UI_PERFORMANCE_THRESHOLDS.NAVIGATION_MS,
    threshold: UI_PERFORMANCE_THRESHOLDS.NAVIGATION_MS,
  };
}

/**
 * Assert that a performance result meets the threshold.
 * 
 * @param result Performance result to assert
 * @throws AssertionError if performance threshold is exceeded
 */
export function assertPerformanceThreshold(result: PerformanceResult): void {
  expect(result.duration).toBeLessThan(
    result.threshold,
    `${result.operation} took ${result.duration.toFixed(2)}ms, expected < ${result.threshold}ms`
  );
}

/**
 * Measure page load time using Playwright's performance metrics.
 * 
 * @param page Playwright page instance
 * @param url URL to navigate to
 * @returns Performance result with duration from page metrics
 */
export async function measurePageLoadWithMetrics(
  page: Page,
  url: string
): Promise<PerformanceResult> {
  await page.goto(url);
  
  // Get performance metrics from the page
  const metrics = await page.metrics();
  const loadTime = metrics?.LoadEventEnd 
    ? metrics.LoadEventEnd - (metrics.NavigationStart || 0)
    : 0;
  
  // Fallback to performance.now() if metrics are not available
  const duration = loadTime > 0 ? loadTime : await page.evaluate(() => {
    return performance.timing.loadEventEnd - performance.timing.navigationStart;
  });
  
  return {
    duration,
    operation: `Page load (metrics): ${url}`,
    passed: duration < UI_PERFORMANCE_THRESHOLDS.PAGE_LOAD_MS,
    threshold: UI_PERFORMANCE_THRESHOLDS.PAGE_LOAD_MS,
  };
}

