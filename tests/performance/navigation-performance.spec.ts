/**
 * Navigation Performance Tests (AC: #8)
 * 
 * Verifies that page navigation transitions complete in under 300ms (AC #8).
 */
import { test, expect } from '../support/fixtures';
import {
  measureNavigationTime,
  assertPerformanceThreshold,
  UI_PERFORMANCE_THRESHOLDS,
} from './ui-performance';

test.describe('Navigation Performance Tests', () => {
  test('navigation from customers to invoices completes in under 300ms', async ({ page }) => {
    // GIVEN: User is on customers page
    await page.goto('/customers');
    await page.waitForLoadState('networkidle');
    
    // WHEN: User navigates to invoices page
    const result = await measureNavigationTime(page, async () => {
      await page.click('a[href="/invoices"]');
    });
    
    // THEN: Navigation completes in under 300ms
    assertPerformanceThreshold(result);
    expect(result.duration).toBeLessThan(UI_PERFORMANCE_THRESHOLDS.NAVIGATION_MS);
  });

  test('navigation from invoices to payments completes in under 300ms', async ({ page }) => {
    // GIVEN: User is on invoices page
    await page.goto('/invoices');
    await page.waitForLoadState('networkidle');
    
    // WHEN: User navigates to payments page
    const result = await measureNavigationTime(page, async () => {
      await page.click('a[href="/payments"]');
    });
    
    // THEN: Navigation completes in under 300ms
    assertPerformanceThreshold(result);
    expect(result.duration).toBeLessThan(UI_PERFORMANCE_THRESHOLDS.NAVIGATION_MS);
  });

  test('navigation from payments to customers completes in under 300ms', async ({ page }) => {
    // GIVEN: User is on payments page
    await page.goto('/payments');
    await page.waitForLoadState('networkidle');
    
    // WHEN: User navigates to customers page
    const result = await measureNavigationTime(page, async () => {
      await page.click('a[href="/customers"]');
    });
    
    // THEN: Navigation completes in under 300ms
    assertPerformanceThreshold(result);
    expect(result.duration).toBeLessThan(UI_PERFORMANCE_THRESHOLDS.NAVIGATION_MS);
  });
});


