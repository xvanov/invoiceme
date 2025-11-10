/**
 * UI Performance Tests for Invoice Management (AC: #6, #7)
 * 
 * Verifies that Invoice UI operations meet performance requirements:
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

test.describe('Invoice UI Performance Tests', () => {
  test('invoice list page loads in under 500ms', async ({ page }) => {
    // GIVEN: User navigates to invoice list page
    const result = await measurePageLoadTime(page, '/invoices');
    
    // THEN: Page load time is under 500ms
    assertPerformanceThreshold(result);
    expect(result.duration).toBeLessThan(UI_PERFORMANCE_THRESHOLDS.PAGE_LOAD_MS);
  });

  test('invoice form submission completes in under 1000ms', async ({ page, customerFactory }) => {
    // GIVEN: A customer exists and user is on create invoice form
    const customer = await customerFactory.createCustomer();
    
    await page.goto('/invoices/new');
    await page.waitForLoadState('networkidle');
    
    // Fill form fields (assuming invoice form structure)
    await page.selectOption('[data-testid="invoice-customer-select"]', customer.id);
    
    // WHEN: User submits the form
    const result = await measureFormSubmissionTime(page, async () => {
      const createInvoicePromise = page.waitForResponse(
        (resp) => resp.url().includes('/api/invoices') && 
                  resp.request().method() === 'POST' && 
                  resp.status() === 201
      );
      
      await page.click('[data-testid="save-invoice-button"]');
      await createInvoicePromise;
      
      // Wait for redirect to complete
      await page.waitForURL(/.*\/invoices/);
    });
    
    // THEN: Form submission completes in under 1000ms
    assertPerformanceThreshold(result);
    expect(result.duration).toBeLessThan(UI_PERFORMANCE_THRESHOLDS.FORM_SUBMISSION_MS);
  });
});


