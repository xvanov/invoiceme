/**
 * E2E Tests for Payment Recording Flow (Story 1.2)
 * 
 * AC #14: E2E test for payment recording flow (select invoice → record payment → verify balance update) passes.
 * 
 * Knowledge Base References:
 * - bmad/bmm/testarch/knowledge/network-first.md
 * - bmad/bmm/testarch/knowledge/test-quality.md
 * - bmad/bmm/testarch/knowledge/fixture-architecture.md
 */
import { test, expect } from '../support/fixtures';

test.describe('Payment Recording Flow - Story 1.2', () => {
  // AC #14: E2E test for payment recording flow (select invoice → record payment → verify balance update) passes.
  test('should complete payment recording flow: select invoice → record payment → verify balance update', async ({ page, customerFactory, request, authCredentials }) => {
    const apiUrl = process.env.API_URL || 'http://localhost:8080/api';
    const authHeaders = {
      'Authorization': `Bearer ${authCredentials.token}`,
      'Content-Type': 'application/json',
    };

    // GIVEN: Customer exists in the system
    const timestamp = Date.now();
    const customer = await customerFactory.createCustomer({ 
      name: 'Test Customer', 
      email: `test-${timestamp}@example.com` 
    });

    // GIVEN: Invoice exists in Sent state with line items
    // Create invoice via API (with auth)
    const createInvoiceResponse = await request.post(`${apiUrl}/invoices`, {
      data: { customerId: customer.id },
      headers: authHeaders,
    });
    
    if (!createInvoiceResponse.ok()) {
      const errorText = await createInvoiceResponse.text();
      throw new Error(`Failed to create invoice: ${createInvoiceResponse.status()} ${errorText}`);
    }
    
    const invoice = await createInvoiceResponse.json();
    const invoiceId = invoice.id;

    // Add line items via API (with auth)
    await request.post(`${apiUrl}/invoices/${invoiceId}/items`, {
      data: {
        description: 'Service 1',
        quantity: 2,
        unitPrice: 100.00
      },
      headers: authHeaders,
    });

    await request.post(`${apiUrl}/invoices/${invoiceId}/items`, {
      data: {
        description: 'Service 2',
        quantity: 3,
        unitPrice: 50.00
      },
      headers: authHeaders,
    });

    // Send invoice via API (with auth)
    await request.post(`${apiUrl}/invoices/${invoiceId}/send`, {
      headers: authHeaders,
    });

    // Verify invoice is in Sent state with balance of 350.00
    const getInvoiceResponse = await request.get(`${apiUrl}/invoices/${invoiceId}`, {
      headers: authHeaders,
    });
    
    if (!getInvoiceResponse.ok()) {
      const errorText = await getInvoiceResponse.text();
      throw new Error(`Failed to get invoice: ${getInvoiceResponse.status()} ${errorText}`);
    }
    
    const sentInvoice = await getInvoiceResponse.json();
    expect(sentInvoice.status).toBe('SENT');
    expect(parseFloat(sentInvoice.balance)).toBe(350.00);

    // STEP 1: Select invoice
    // Navigate to invoices page
    const invoicesListPromise = page.waitForResponse(
      (resp) => resp.url().includes('/api/invoices') && resp.status() === 200
    );

    await page.goto('/invoices');
    await invoicesListPromise;

    // Find and click on the invoice
    const invoiceRow = page.locator(`[data-testid="invoice-row-${invoiceId}"]`);
    await expect(invoiceRow).toBeVisible();

    const invoiceDetailPromise = page.waitForResponse(
      (resp) => resp.url().includes(`/api/invoices/${invoiceId}`) && resp.status() === 200
    );

    await invoiceRow.click();
    await invoiceDetailPromise;

    // Verify invoice detail page is displayed
    await expect(page).toHaveURL(new RegExp(`/invoices/${invoiceId}`));
    await expect(page.locator('[data-testid="invoice-status"]')).toContainText(/sent/i);
    await expect(page.locator('[data-testid="invoice-balance"]')).toContainText('350.00');

    // STEP 2: Record payment
    // Navigate to record payment page or click record payment button
    await page.click('[data-testid="record-payment-button"]');

    // Fill payment form
    await page.fill('[data-testid="payment-amount-input"]', '350.00');
    
    // Set payment date (if required)
    const paymentDate = new Date().toISOString().split('T')[0];
    await page.fill('[data-testid="payment-date-input"]', paymentDate);

    const recordPaymentPromise = page.waitForResponse(
      (resp) => resp.url().includes('/api/payments') && resp.request().method() === 'POST' && resp.status() === 201
    );

    await page.click('[data-testid="save-payment-button"]');
    await recordPaymentPromise;

    // STEP 3: Verify balance update
    // Wait for invoice detail page to refresh
    const updatedInvoicePromise = page.waitForResponse(
      (resp) => resp.url().includes(`/api/invoices/${invoiceId}`) && resp.status() === 200
    );

    // Navigate back to invoice detail or wait for refresh
    await page.goto(`/invoices/${invoiceId}`);
    await updatedInvoicePromise;

    // Verify invoice balance is reduced to zero
    await expect(page.locator('[data-testid="invoice-balance"]')).toContainText('0.00');

    // Verify invoice state transitions to Paid
    await expect(page.locator('[data-testid="invoice-status"]')).toContainText(/paid/i);

    // Verify payment is listed in payments section
    await expect(page.locator('[data-testid="payment-row"]').first()).toBeVisible();
    await expect(page.locator('[data-testid="payment-amount"]').first()).toContainText('350.00');
  });
});

