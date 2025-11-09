/**
 * E2E Tests for Customer Management (Story 1.1)
 * 
 * These tests are in RED phase - they will fail until implementation is complete.
 * Following TDD red-green-refactor cycle.
 * 
 * Knowledge Base References:
 * - bmad/bmm/testarch/knowledge/network-first.md
 * - bmad/bmm/testarch/knowledge/test-quality.md
 * - bmad/bmm/testarch/knowledge/fixture-architecture.md
 */
import { test, expect } from '../support/fixtures';
import { createCustomer } from '../support/factories/customer-factory';

test.describe('Customer Management - Story 1.1', () => {
  // AC #1: Given a user is on the customer list page, when they click "Create Customer", 
  //        then a form is displayed with fields for name and email.
  test('should display create customer form when clicking Create Customer', async ({ page }) => {
    // GIVEN: User is on the customer list page
    const customersListPromise = page.waitForResponse(
      (resp) => resp.url().includes('/api/customers') && resp.status() === 200
    );

    await page.goto('/customers');
    await customersListPromise;

    // WHEN: User clicks "Create Customer"
    await page.click('[data-testid="create-customer-button"]');

    // THEN: Form is displayed with fields for name and email
    await expect(page.locator('[data-testid="customer-name-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="customer-email-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="save-customer-button"]')).toBeVisible();
  });

  // AC #2: Given a user submits a valid customer form (name and email provided), 
  //        when they click "Save", then the customer is created and persisted in the database, 
  //        and the user is redirected to the customer list with a success message.
  test('should create customer and redirect to list with success message', async ({ page, customerFactory }) => {
    // GIVEN: User is on create customer form
    const createFormPromise = page.waitForResponse(
      (resp) => resp.url().includes('/api/customers') && resp.request().method() === 'GET'
    );

    await page.goto('/customers/new');
    await createFormPromise;

    const customerData = createCustomer();

    // WHEN: User submits valid customer form and clicks "Save"
    const createCustomerPromise = page.waitForResponse(
      (resp) => resp.url().includes('/api/customers') && resp.request().method() === 'POST' && resp.status() === 201
    );

    await page.fill('[data-testid="customer-name-input"]', customerData.name);
    await page.fill('[data-testid="customer-email-input"]', customerData.email);
    await page.click('[data-testid="save-customer-button"]');

    await createCustomerPromise;

    // THEN: User is redirected to customer list
    await expect(page).toHaveURL(/.*\/customers/);

    // THEN: Success message is displayed
    await expect(page.locator('[data-testid="success-message"]')).toContainText(/customer.*created/i);

    // THEN: Customer appears in list
    await expect(page.getByText(customerData.name)).toBeVisible();
    await expect(page.getByText(customerData.email)).toBeVisible();
  });

  // AC #3: Given a customer exists in the system, when a user views the customer list, 
  //        then all customers are displayed in a table with name and email columns.
  test('should display all customers in table with name and email columns', async ({ page, customerFactory }) => {
    // GIVEN: Customers exist in the system
    const timestamp = Date.now();
    const customer1 = await customerFactory.createCustomer({ name: 'Acme Corp', email: `acme-${timestamp}@example.com` });
    const customer2 = await customerFactory.createCustomer({ name: 'Tech Inc', email: `tech-${timestamp}@example.com` });

    // WHEN: User views the customer list
    const customersListPromise = page.waitForResponse(
      (resp) => resp.url().includes('/api/customers') && resp.status() === 200
    );

    await page.goto('/customers');
    await customersListPromise;

    // THEN: All customers are displayed in a table
    await expect(page.locator('[data-testid="customers-table"]')).toBeVisible();

    // THEN: Table has name and email columns
    await expect(page.locator('[data-testid="customer-name-column"]')).toBeVisible();
    await expect(page.locator('[data-testid="customer-email-column"]')).toBeVisible();

    // THEN: Customer data is visible - use specific row selectors to avoid strict mode violations
    await expect(page.locator(`[data-testid="customer-row-${customer1.id}"]`)).toBeVisible();
    await expect(page.locator(`[data-testid="customer-row-${customer1.id}"]`).getByText(customer1.name)).toBeVisible();
    await expect(page.locator(`[data-testid="customer-row-${customer1.id}"]`).getByText(customer1.email)).toBeVisible();
    await expect(page.locator(`[data-testid="customer-row-${customer2.id}"]`)).toBeVisible();
    await expect(page.locator(`[data-testid="customer-row-${customer2.id}"]`).getByText(customer2.name)).toBeVisible();
    await expect(page.locator(`[data-testid="customer-row-${customer2.id}"]`).getByText(customer2.email)).toBeVisible();
  });

  // AC #4: Given a customer exists in the system, when a user clicks on a customer in the list, 
  //        then the customer detail page is displayed with all customer information.
  test('should display customer detail page when clicking on customer in list', async ({ page, customerFactory }) => {
    // GIVEN: Customer exists in the system
    const timestamp = Date.now();
    const customer = await customerFactory.createCustomer({ name: 'Acme Corp', email: `acme-${timestamp}@example.com` });

    // WHEN: User clicks on customer in the list
    const customersListPromise = page.waitForResponse(
      (resp) => resp.url().includes('/api/customers') && resp.status() === 200
    );

    await page.goto('/customers');
    await customersListPromise;

    const customerDetailPromise = page.waitForResponse(
      (resp) => resp.url().includes(`/api/customers/${customer.id}`) && resp.status() === 200
    );

    await page.click(`[data-testid="customer-row-${customer.id}"]`);
    await customerDetailPromise;

    // THEN: Customer detail page is displayed
    await expect(page).toHaveURL(new RegExp(`/customers/${customer.id}`));

    // THEN: All customer information is displayed
    await expect(page.getByText(customer.name)).toBeVisible();
    await expect(page.getByText(customer.email)).toBeVisible();
  });

  // AC #5: Given a user is viewing a customer detail page, when they click "Edit", 
  //        then the customer form is displayed pre-filled with existing data.
  test('should display edit form pre-filled with existing customer data', async ({ page, customerFactory }) => {
    // GIVEN: User is viewing customer detail page
    const timestamp = Date.now();
    const customer = await customerFactory.createCustomer({ name: 'Acme Corp', email: `acme-${timestamp}@example.com` });

    const customerDetailPromise = page.waitForResponse(
      (resp) => resp.url().includes(`/api/customers/${customer.id}`) && resp.status() === 200
    );

    await page.goto(`/customers/${customer.id}`);
    await customerDetailPromise;

    // WHEN: User clicks "Edit"
    await page.click('[data-testid="edit-customer-button"]');

    // THEN: Customer form is displayed pre-filled with existing data
    await expect(page.locator('[data-testid="customer-name-input"]')).toHaveValue(customer.name);
    await expect(page.locator('[data-testid="customer-email-input"]')).toHaveValue(customer.email);
  });

  // AC #6: Given a user submits an updated customer form, when they click "Save", 
  //        then the customer information is updated in the database, 
  //        and changes are reflected when the customer is retrieved.
  test('should update customer information and reflect changes', async ({ page, customerFactory }) => {
    // GIVEN: Customer exists and user is on edit form
    const timestamp = Date.now();
    const customer = await customerFactory.createCustomer({ name: 'Acme Corp', email: `acme-${timestamp}@example.com` });

    const customerDetailPromise = page.waitForResponse(
      (resp) => resp.url().includes(`/api/customers/${customer.id}`) && resp.status() === 200
    );

    await page.goto(`/customers/${customer.id}`);
    await customerDetailPromise;

    await page.click('[data-testid="edit-customer-button"]');

    const updatedName = 'Updated Acme Corp';
    const updatedEmail = 'updated@acme.com';

    // WHEN: User submits updated customer form and clicks "Save"
    const updateCustomerPromise = page.waitForResponse(
      (resp) => resp.url().includes(`/api/customers/${customer.id}`) && resp.request().method() === 'PUT' && resp.status() === 200
    );

    await page.fill('[data-testid="customer-name-input"]', updatedName);
    await page.fill('[data-testid="customer-email-input"]', updatedEmail);
    await page.click('[data-testid="save-customer-button"]');

    await updateCustomerPromise;

    // THEN: Customer information is updated
    // After update, editing is set to false, so we should see the detail view
    // Wait for edit form to disappear and detail view to appear
    await expect(page.locator('[data-testid="edit-customer-button"]')).toBeVisible({ timeout: 5000 });
    
    // Verify updated data is visible in detail view
    await expect(page.getByText(updatedName)).toBeVisible();
    await expect(page.getByText(updatedEmail)).toBeVisible();
  });

  // AC #7: Given a customer exists in the system, when a user clicks "Delete" and confirms, 
  //        then the customer is removed from the database, 
  //        and the user is redirected to the customer list.
  test('should delete customer and redirect to list', async ({ page, customerFactory }) => {
    // GIVEN: Customer exists in the system
    const timestamp = Date.now();
    const customer = await customerFactory.createCustomer({ name: 'Acme Corp', email: `acme-${timestamp}@example.com` });

    const customerDetailPromise = page.waitForResponse(
      (resp) => resp.url().includes(`/api/customers/${customer.id}`) && resp.status() === 200
    );

    await page.goto(`/customers/${customer.id}`);
    await customerDetailPromise;

    // WHEN: User clicks "Delete" and confirms
    const deleteCustomerPromise = page.waitForResponse(
      (resp) => resp.url().includes(`/api/customers/${customer.id}`) && resp.request().method() === 'DELETE' && resp.status() === 200
    );

    // Handle confirmation dialog
    page.on('dialog', async (dialog) => {
      await dialog.accept();
    });

    await page.click('[data-testid="delete-customer-button"]');
    await deleteCustomerPromise;

    // THEN: User is redirected to customer list
    await expect(page).toHaveURL(/.*\/customers/);
    
    // Wait for customer list to refresh after deletion
    await page.waitForResponse(
      (resp) => resp.url().includes('/api/customers') && resp.status() === 200
    );

    // THEN: Customer is removed from list - use specific row selector to avoid false positives
    await expect(page.locator(`[data-testid="customer-row-${customer.id}"]`)).not.toBeVisible();
  });

  // AC #8: Given invalid customer data (empty name or invalid email), 
  //        when a user submits the form, then validation errors are displayed, 
  //        and the customer is not created/updated.
  test('should display validation errors for invalid customer data', async ({ page }) => {
    // GIVEN: User is on create customer form
    await page.goto('/customers/new');
    
    // Wait for form to be ready
    await expect(page.locator('[data-testid="customer-name-input"]')).toBeVisible();

    // WHEN: User submits form with empty name
    await page.fill('[data-testid="customer-email-input"]', 'valid@example.com');
    await page.click('[data-testid="save-customer-button"]');

    // THEN: Validation error is displayed for name
    await expect(page.locator('[data-testid="customer-name-error"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('[data-testid="customer-name-error"]')).toContainText(/required|empty/i);

    // WHEN: User fills name and submits form with invalid email
    await page.fill('[data-testid="customer-name-input"]', 'Valid Name');
    // Clear email field first, then fill with invalid email
    await page.fill('[data-testid="customer-email-input"]', '');
    await page.fill('[data-testid="customer-email-input"]', 'invalid-email');
    await page.click('[data-testid="save-customer-button"]');

    // THEN: Validation error is displayed for email
    // Wait a bit for validation to run and error to appear
    await page.waitForTimeout(500);
    await expect(page.locator('[data-testid="customer-email-error"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('[data-testid="customer-email-error"]')).toContainText(/invalid|email|valid/i);
  });

  // AC #11: E2E test for customer management flow (create → view → edit → delete) passes.
  test('should complete full customer management flow', async ({ page, customerFactory }) => {
    // GIVEN: User is on customer list page
    const customersListPromise = page.waitForResponse(
      (resp) => resp.url().includes('/api/customers') && resp.status() === 200
    );

    await page.goto('/customers');
    await customersListPromise;

    // STEP 1: Create customer
    const customerData = createCustomer();

    await page.click('[data-testid="create-customer-button"]');
    await page.fill('[data-testid="customer-name-input"]', customerData.name);
    await page.fill('[data-testid="customer-email-input"]', customerData.email);

    const createPromise = page.waitForResponse(
      (resp) => resp.url().includes('/api/customers') && resp.request().method() === 'POST' && resp.status() === 201
    );

    await page.click('[data-testid="save-customer-button"]');
    await createPromise;

    // STEP 2: View customer in list
    await expect(page.getByText(customerData.name)).toBeVisible();
    await expect(page.getByText(customerData.email)).toBeVisible();

    // STEP 3: View customer detail - find the customer row and click it
    // Wait for the customer to appear in the list, then find its row
    const customerRow = page.locator('[data-testid^="customer-row-"]').filter({ hasText: customerData.name }).first();
    await expect(customerRow).toBeVisible();
    
    // Extract customer ID from the row's data-testid
    const rowTestId = await customerRow.getAttribute('data-testid');
    const customerId = rowTestId?.replace('customer-row-', '') || '';
    
    const detailPromise = page.waitForResponse(
      (resp) => resp.url().includes(`/api/customers/${customerId}`) && resp.status() === 200
    );

    await customerRow.click();
    await detailPromise;

    await expect(page.getByText(customerData.name)).toBeVisible();

    // STEP 4: Edit customer
    await page.click('[data-testid="edit-customer-button"]');
    const updatedName = 'Updated ' + customerData.name;

    const updatePromise = page.waitForResponse(
      (resp) => resp.url().includes(`/api/customers/${customerId}`) && resp.request().method() === 'PUT' && resp.status() === 200
    );

    await page.fill('[data-testid="customer-name-input"]', updatedName);
    await page.click('[data-testid="save-customer-button"]');
    await updatePromise;

    // Wait for detail view to appear after update
    await expect(page.locator('[data-testid="edit-customer-button"]')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(updatedName)).toBeVisible();

    // STEP 5: Delete customer
    page.on('dialog', async (dialog) => {
      await dialog.accept();
    });

    const deletePromise = page.waitForResponse(
      (resp) => resp.url().includes(`/api/customers/${customerId}`) && resp.request().method() === 'DELETE' && resp.status() === 200
    );

    await page.click('[data-testid="delete-customer-button"]');
    await deletePromise;

    // THEN: Redirected to list and customer removed
    await expect(page).toHaveURL(/.*\/customers/);
    await expect(page.getByText(updatedName)).not.toBeVisible();
  });
});

