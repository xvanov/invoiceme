/**
 * E2E Tests for Complete User Journey (Story 1.3)
 * 
 * AC #11: E2E test for complete user journey (login → create customer → create invoice → record payment) passes.
 * 
 * Knowledge Base References:
 * - bmad/bmm/testarch/knowledge/network-first.md
 * - bmad/bmm/testarch/knowledge/test-quality.md
 * - bmad/bmm/testarch/knowledge/fixture-architecture.md
 */
import { test, expect } from '../support/fixtures';

test.describe('Complete User Journey - Story 1.3', () => {
  // AC #11: E2E test for complete user journey (login → create customer → create invoice → record payment) passes.
  test('should complete full user journey: login → create customer → create invoice → record payment', async ({ page, customerFactory }) => {
    // STEP 1: Login
    // Navigate to login page
    await page.goto('/login');
    
    // Wait for login form to be visible
    await expect(page.locator('[data-testid="login-email"]')).toBeVisible();
    await expect(page.locator('[data-testid="login-password"]')).toBeVisible();
    
    // Fill login form
    await page.fill('[data-testid="login-email"]', 'test@example.com');
    await page.fill('[data-testid="login-password"]', 'password123');
    
    // Submit login form
    const loginPromise = page.waitForResponse(
      (resp) => resp.url().includes('/api/auth/login') && resp.status() === 200
    );
    
    await page.click('[data-testid="login-submit"]');
    await loginPromise;
    
    // Verify redirect to customers page after login
    await expect(page).toHaveURL(/\/customers/);
    await expect(page.locator('[data-testid="customers-table"]')).toBeVisible();
    
    // STEP 2: Create customer
    // Click "Create Customer"
    await page.click('[data-testid="create-customer-button"]');
    
    // Wait for create customer form
    await expect(page.locator('[data-testid="customer-name-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="customer-email-input"]')).toBeVisible();
    
    // Fill customer form
    const timestamp = Date.now();
    const customerName = `Test Customer ${timestamp}`;
    const customerEmail = `customer-${timestamp}@example.com`;
    
    await page.fill('[data-testid="customer-name-input"]', customerName);
    await page.fill('[data-testid="customer-email-input"]', customerEmail);
    
    // Submit customer form
    const createCustomerPromise = page.waitForResponse(
      (resp) => resp.url().includes('/api/customers') && resp.request().method() === 'POST' && resp.status() === 201
    );
    
    await page.click('[data-testid="save-customer-button"]');
    await createCustomerPromise;
    
    // Verify redirect to customers list with success message
    await expect(page).toHaveURL(/\/customers/);
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="customers-table"]')).toContainText(customerName);
    
    // Extract customer ID from table row
    const customerRow = page.locator(`[data-testid^="customer-row-"]`).first();
    const customerId = await customerRow.getAttribute('data-testid');
    const extractedCustomerId = customerId?.replace('customer-row-', '');
    expect(extractedCustomerId).toBeTruthy();
    
    // STEP 3: Create invoice
    // Navigate to invoices page
    await page.click('text=Invoices');
    
    const invoicesListPromise = page.waitForResponse(
      (resp) => resp.url().includes('/api/invoices') && resp.status() === 200
    );
    
    await page.waitForURL(/\/invoices/);
    await invoicesListPromise;
    
    // Click "Create Invoice"
    await page.click('[data-testid="create-invoice-button"]');
    
    // Wait for create invoice form
    await expect(page.locator('[data-testid="invoice-customer-id-input"]')).toBeVisible();
    
    // Fill invoice form with customer ID
    await page.fill('[data-testid="invoice-customer-id-input"]', extractedCustomerId!);
    
    // Submit invoice form
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
    expect(invoiceIdMatch).toBeTruthy();
    const invoiceId = invoiceIdMatch![1];
    
    // STEP 4: Add line items
    // Add first line item
    await page.fill('[data-testid="line-item-description-input"]', 'Item 1');
    await page.fill('[data-testid="line-item-quantity-input"]', '2');
    await page.fill('[data-testid="line-item-unit-price-input"]', '10.00');
    
    const addLineItemPromise1 = page.waitForResponse(
      (resp) => resp.url().includes(`/api/invoices/${invoiceId}/items`) && resp.request().method() === 'POST' && resp.status() === 200
    );
    
    await page.click('[data-testid="add-line-item-button"]');
    await addLineItemPromise1;
    
    // Verify balance updated: 2 × 10.00 = 20.00
    await expect(page.locator('[data-testid="invoice-balance"]')).toContainText('20.00');
    
    // Add second line item
    await page.fill('[data-testid="line-item-description-input"]', 'Item 2');
    await page.fill('[data-testid="line-item-quantity-input"]', '3');
    await page.fill('[data-testid="line-item-unit-price-input"]', '15.00');
    
    const addLineItemPromise2 = page.waitForResponse(
      (resp) => resp.url().includes(`/api/invoices/${invoiceId}/items`) && resp.request().method() === 'POST' && resp.status() === 200
    );
    
    await page.click('[data-testid="add-line-item-button"]');
    await addLineItemPromise2;
    
    // Verify balance updated: 20.00 + 45.00 = 65.00
    await expect(page.locator('[data-testid="invoice-balance"]')).toContainText('65.00');
    
    // STEP 5: Send invoice
    const sendInvoicePromise = page.waitForResponse(
      (resp) => resp.url().includes(`/api/invoices/${invoiceId}/send`) && resp.request().method() === 'POST' && resp.status() === 200
    );
    
    await page.click('[data-testid="send-invoice-button"]');
    await sendInvoicePromise;
    
    // Verify invoice status changed to Sent
    await expect(page.locator('[data-testid="invoice-status"]')).toContainText(/sent/i);
    await expect(page.locator('[data-testid="invoice-balance"]')).toContainText('65.00');
    
    // STEP 6: Record payment
    // Navigate to payments page
    await page.click('text=Payments');
    
    const paymentsListPromise = page.waitForResponse(
      (resp) => resp.url().includes('/api/payments') && resp.status() === 200
    );
    
    await page.waitForURL(/\/payments/);
    await paymentsListPromise;
    
    // Click "Record Payment"
    await page.click('[data-testid="record-payment-button"]');
    
    // Wait for record payment form
    await expect(page.locator('[data-testid="payment-invoice-id-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="payment-amount-input"]')).toBeVisible();
    
    // Fill payment form
    await page.fill('[data-testid="payment-invoice-id-input"]', invoiceId);
    await page.fill('[data-testid="payment-amount-input"]', '65.00');
    
    // Submit payment form
    const recordPaymentPromise = page.waitForResponse(
      (resp) => resp.url().includes('/api/payments') && resp.request().method() === 'POST' && resp.status() === 201
    );
    
    await page.click('[data-testid="save-payment-button"]');
    await recordPaymentPromise;
    
    // Verify redirect to payments list with success message
    await expect(page).toHaveURL(/\/payments/);
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    
    // STEP 7: Verify invoice transitions to Paid state
    // Navigate back to invoice detail page
    await page.goto(`/invoices/${invoiceId}`);
    
    const invoiceDetailPromise = page.waitForResponse(
      (resp) => resp.url().includes(`/api/invoices/${invoiceId}`) && resp.status() === 200
    );
    
    await invoiceDetailPromise;
    
    // Verify invoice status is Paid and balance is zero
    await expect(page.locator('[data-testid="invoice-status"]')).toContainText(/paid/i);
    await expect(page.locator('[data-testid="invoice-balance"]')).toContainText('0');
    
    // Verify payments are listed
    await expect(page.locator('[data-testid="payments-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="payments-list"]')).toContainText('65.00');
  });
  
  test('should verify UI updates correctly throughout flow', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('[data-testid="login-email"]', 'test@example.com');
    await page.fill('[data-testid="login-password"]', 'password123');
    await page.click('[data-testid="login-submit"]');
    await page.waitForURL(/\/customers/);
    
    // Verify navigation shows user email
    await expect(page.locator('text=test@example.com')).toBeVisible();
    
    // Verify logout button is visible
    await expect(page.locator('[data-testid="logout-button"]')).toBeVisible();
  });
  
  test('should verify state transitions visible in UI', async ({ page, customerFactory }) => {
    // Login
    await page.goto('/login');
    await page.fill('[data-testid="login-email"]', 'test@example.com');
    await page.fill('[data-testid="login-password"]', 'password123');
    await page.click('[data-testid="login-submit"]');
    await page.waitForURL(/\/customers/);
    
    // Create customer
    const customer = await customerFactory.createCustomer({ 
      name: 'Test Customer', 
      email: `test-${Date.now()}@example.com` 
    });
    
    // Create invoice
    await page.goto('/invoices');
    await page.click('[data-testid="create-invoice-button"]');
    await page.fill('[data-testid="invoice-customer-id-input"]', customer.id);
    await page.click('[data-testid="save-invoice-button"]');
    await page.waitForURL(/\/invoices\/[^\/]+/);
    
    // Verify Draft status
    await expect(page.locator('[data-testid="invoice-status"]')).toContainText(/draft/i);
    
    // Send invoice
    await page.click('[data-testid="send-invoice-button"]');
    
    // Verify Sent status
    await expect(page.locator('[data-testid="invoice-status"]')).toContainText(/sent/i);
    
    // Add line item and record payment
    await page.fill('[data-testid="line-item-description-input"]', 'Item');
    await page.fill('[data-testid="line-item-quantity-input"]', '1');
    await page.fill('[data-testid="line-item-unit-price-input"]', '10.00');
    await page.click('[data-testid="add-line-item-button"]');
    await page.waitForTimeout(500); // Wait for balance update
    
    await page.goto('/payments');
    await page.click('[data-testid="record-payment-button"]');
    const invoiceUrl = page.url();
    const invoiceId = invoiceUrl.match(/\/invoices\/([^\/]+)/)?.[1];
    await page.fill('[data-testid="payment-invoice-id-input"]', invoiceId!);
    await page.fill('[data-testid="payment-amount-input"]', '10.00');
    await page.click('[data-testid="save-payment-button"]');
    
    // Verify Paid status
    await page.goto(`/invoices/${invoiceId}`);
    await expect(page.locator('[data-testid="invoice-status"]')).toContainText(/paid/i);
  });
  
  test('should verify balance calculations displayed correctly', async ({ page, customerFactory }) => {
    // Login
    await page.goto('/login');
    await page.fill('[data-testid="login-email"]', 'test@example.com');
    await page.fill('[data-testid="login-password"]', 'password123');
    await page.click('[data-testid="login-submit"]');
    await page.waitForURL(/\/customers/);
    
    // Create customer and invoice
    const customer = await customerFactory.createCustomer({ 
      name: 'Test Customer', 
      email: `test-${Date.now()}@example.com` 
    });
    
    await page.goto('/invoices');
    await page.click('[data-testid="create-invoice-button"]');
    await page.fill('[data-testid="invoice-customer-id-input"]', customer.id);
    await page.click('[data-testid="save-invoice-button"]');
    await page.waitForURL(/\/invoices\/[^\/]+/);
    
    // Initial balance should be 0
    await expect(page.locator('[data-testid="invoice-balance"]')).toContainText('0');
    
    // Add line item: 2 × 10.00 = 20.00
    await page.fill('[data-testid="line-item-description-input"]', 'Item 1');
    await page.fill('[data-testid="line-item-quantity-input"]', '2');
    await page.fill('[data-testid="line-item-unit-price-input"]', '10.00');
    await page.click('[data-testid="add-line-item-button"]');
    await page.waitForTimeout(500);
    
    await expect(page.locator('[data-testid="invoice-balance"]')).toContainText('20.00');
    
    // Add another line item: 3 × 15.00 = 45.00, total = 65.00
    await page.fill('[data-testid="line-item-description-input"]', 'Item 2');
    await page.fill('[data-testid="line-item-quantity-input"]', '3');
    await page.fill('[data-testid="line-item-unit-price-input"]', '15.00');
    await page.click('[data-testid="add-line-item-button"]');
    await page.waitForTimeout(500);
    
    await expect(page.locator('[data-testid="invoice-balance"]')).toContainText('65.00');
  });
});

