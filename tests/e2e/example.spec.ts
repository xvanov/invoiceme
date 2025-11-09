/**
 * Example Test Suite
 * 
 * This file demonstrates:
 * - Fixture usage (userFactory)
 * - Network-first testing patterns
 * - Data factory usage
 * - Proper selector strategy (data-testid)
 * 
 * Knowledge Base References:
 * - bmad/bmm/testarch/knowledge/fixture-architecture.md
 * - bmad/bmm/testarch/knowledge/data-factories.md
 * - bmad/bmm/testarch/knowledge/network-first.md
 */
import { test, expect } from '../support/fixtures';

test.describe('Example Test Suite', () => {
  test('should load homepage', async ({ page }) => {
    // Network-first: Wait for response before asserting
    const responsePromise = page.waitForResponse(
      (resp) => resp.url().includes('/api') && resp.status() === 200
    );

    await page.goto('/');

    // Wait for API response
    await responsePromise;

    // Assert on page content
    await expect(page).toHaveTitle(/InvoiceMe/i);
  });

  test.skip('should create user and login', async ({ page, userFactory }) => {
    // SKIPPED: Authentication not implemented yet (not part of Story 1.1)
    // Step 1: Create test user via API (fast, parallel-safe)
    const user = await userFactory.createUser({
      email: 'test@example.com',
      name: 'Test User',
    });

    // Step 2: Network-first: Intercept login request
    const loginPromise = page.waitForResponse(
      (resp) => resp.url().includes('/api/auth/login') && resp.status() === 200
    );

    // Step 3: Navigate to login page
    await page.goto('/login');

    // Step 4: Fill login form (use data-testid selectors)
    await page.fill('[data-testid="email-input"]', user.email);
    await page.fill('[data-testid="password-input"]', 'password123');
    
    // Step 5: Click login button
    await page.click('[data-testid="login-button"]');

    // Step 6: Wait for login response
    await loginPromise;

    // Step 7: Assert login success
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    await expect(page).toHaveURL(/.*dashboard/);

    // Note: userFactory.cleanup() is called automatically by fixture teardown
  });

  test('should display customer list', async ({ page, userFactory }) => {
    // Setup: Create test customer
    const customer = await userFactory.createUser({
      name: 'Acme Corporation',
      email: 'contact@acme.com',
    });

    // Network-first: Intercept customers API call
    const customersPromise = page.waitForResponse(
      (resp) => resp.url().includes('/api/customers') && resp.status() === 200
    );

    // Navigate to customers page
    await page.goto('/customers');

    // Wait for API response
    const response = await customersPromise;
    const customers = await response.json();

    // Assert customer is in list
    expect(customers).toContainEqual(
      expect.objectContaining({ id: customer.id })
    );
    await expect(page.getByText(customer.name)).toBeVisible();
  });
});


