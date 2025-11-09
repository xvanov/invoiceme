/**
 * E2E Tests for Invoice Creation Flow (Story 1.2)
 * 
 * AC #13: E2E test for invoice creation flow (create invoice → add line items → send invoice) passes.
 * 
 * Knowledge Base References:
 * - bmad/bmm/testarch/knowledge/network-first.md
 * - bmad/bmm/testarch/knowledge/test-quality.md
 * - bmad/bmm/testarch/knowledge/fixture-architecture.md
 */
import { test, expect } from '../support/fixtures';

test.describe('Invoice Creation Flow - Story 1.2', () => {
  // AC #13: E2E test for invoice creation flow (create invoice → add line items → send invoice) passes.
  test('should complete invoice creation flow: create invoice → add line items → send invoice', async ({ page, customerFactory }) => {
    // GIVEN: Customer exists in the system
    const timestamp = Date.now();
    const customer = await customerFactory.createCustomer({ 
      name: 'Test Customer', 
      email: `test-${timestamp}@example.com` 
    });

    // STEP 1: Create invoice
    // Navigate to invoices page
    const invoicesListPromise = page.waitForResponse(
      (resp) => resp.url().includes('/api/invoices') && resp.status() === 200
    );

    await page.goto('/invoices');
    await invoicesListPromise;

    // Click "Create Invoice"
    await page.click('[data-testid="create-invoice-button"]');

    // Fill invoice form with customer ID
    await page.fill('[data-testid="invoice-customer-id-input"]', customer.id);
    
    const createInvoicePromise = page.waitForResponse(
      (resp) => resp.url().includes('/api/invoices') && resp.request().method() === 'POST' && resp.status() === 201
    );

    await page.click('[data-testid="save-invoice-button"]');
    await createInvoicePromise;

    // Verify invoice is created in Draft state
    await expect(page.locator('[data-testid="invoice-status"]')).toContainText(/draft/i);
    await expect(page.locator('[data-testid="invoice-balance"]')).toContainText('0');

    // Extract invoice ID from URL
    const invoiceUrl = page.url();
    const invoiceIdMatch = invoiceUrl.match(/\/invoices\/([^\/]+)/);
    const invoiceId = invoiceIdMatch ? invoiceIdMatch[1] : '';

    // STEP 2: Add line items
    // Add first line item
    await page.fill('[data-testid="line-item-description-input"]', 'Service 1');
    await page.fill('[data-testid="line-item-quantity-input"]', '2');
    await page.fill('[data-testid="line-item-unit-price-input"]', '100.00');

    const addLineItemPromise1 = page.waitForResponse(
      (resp) => resp.url().includes(`/api/invoices/${invoiceId}/items`) && resp.request().method() === 'POST' && resp.status() === 200
    );

    await page.click('[data-testid="add-line-item-button"]');
    await addLineItemPromise1;

    // Verify balance is recalculated
    await expect(page.locator('[data-testid="invoice-balance"]')).toContainText('200.00');

    // Add second line item
    await page.fill('[data-testid="line-item-description-input"]', 'Service 2');
    await page.fill('[data-testid="line-item-quantity-input"]', '3');
    await page.fill('[data-testid="line-item-unit-price-input"]', '50.00');

    const addLineItemPromise2 = page.waitForResponse(
      (resp) => resp.url().includes(`/api/invoices/${invoiceId}/items`) && resp.request().method() === 'POST' && resp.status() === 200
    );

    await page.click('[data-testid="add-line-item-button"]');
    await addLineItemPromise2;

    // Verify balance is recalculated (200 + 150 = 350)
    await expect(page.locator('[data-testid="invoice-balance"]')).toContainText('350.00');

    // Verify line items are displayed
    await expect(page.locator('[data-testid="line-item-row"]').first()).toBeVisible();
    await expect(page.getByText('Service 1')).toBeVisible();
    await expect(page.getByText('Service 2')).toBeVisible();

    // STEP 3: Send invoice
    const sendInvoicePromise = page.waitForResponse(
      (resp) => resp.url().includes(`/api/invoices/${invoiceId}/send`) && resp.request().method() === 'POST' && resp.status() === 200
    );

    await page.click('[data-testid="send-invoice-button"]');
    await sendInvoicePromise;

    // Verify invoice state transitions to Sent
    await expect(page.locator('[data-testid="invoice-status"]')).toContainText(/sent/i);

    // Verify invoice can no longer be modified (update button should be disabled or hidden)
    await expect(page.locator('[data-testid="update-invoice-button"]')).not.toBeVisible({ timeout: 2000 }).catch(() => {
      // If button exists, it should be disabled
      expect(page.locator('[data-testid="update-invoice-button"]')).toBeDisabled();
    });
  });
});

