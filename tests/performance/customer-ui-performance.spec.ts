/**
 * UI Performance Tests for Customer Management (AC: #6, #7)
 * 
 * Verifies that Customer UI operations meet performance requirements:
 * - Page load time < 500ms (AC #6)
 * - Form submission time < 1000ms (AC #7)
 */
import { test, expect } from '../support/fixtures';
import {
  measurePageLoadTime,
  measureFormSubmissionTime,
  assertPerformanceThreshold,
  UI_PERFORMANCE_THRESHOLDS,
} from './ui-performance';
import { createCustomer } from '../support/factories/customer-factory';

test.describe('Customer UI Performance Tests', () => {
  test('customer list page loads in under 500ms', async ({ page }) => {
    // GIVEN: User navigates to customer list page
    const result = await measurePageLoadTime(page, '/customers');
    
    // THEN: Page load time is under 500ms
    assertPerformanceThreshold(result);
    expect(result.duration).toBeLessThan(UI_PERFORMANCE_THRESHOLDS.PAGE_LOAD_MS);
  });

  test('customer form submission completes in under 1000ms', async ({ page, customerFactory }) => {
    // GIVEN: User is on create customer form
    await page.goto('/customers/new');
    await page.waitForLoadState('networkidle');
    
    const customerData = createCustomer();
    
    // Fill form fields
    await page.fill('[data-testid="customer-name-input"]', customerData.name);
    await page.fill('[data-testid="customer-email-input"]', customerData.email);
    
    // WHEN: User submits the form
    const result = await measureFormSubmissionTime(page, async () => {
      const createCustomerPromise = page.waitForResponse(
        (resp) => resp.url().includes('/api/customers') && 
                  resp.request().method() === 'POST' && 
                  resp.status() === 201
      );
      
      await page.click('[data-testid="save-customer-button"]');
      await createCustomerPromise;
      
      // Wait for redirect to complete
      await page.waitForURL(/.*\/customers/);
    });
    
    // THEN: Form submission completes in under 1000ms
    assertPerformanceThreshold(result);
    expect(result.duration).toBeLessThan(UI_PERFORMANCE_THRESHOLDS.FORM_SUBMISSION_MS);
  });
});


