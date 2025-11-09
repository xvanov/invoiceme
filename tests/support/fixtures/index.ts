/**
 * Test Fixtures - Composable Fixture Architecture
 * 
 * This file follows the pure function → fixture → mergeTests pattern:
 * - Pure functions in helpers/ are unit-testable
 * - Fixtures wrap pure functions with framework dependencies
 * - mergeTests composes multiple fixtures without inheritance
 * 
 * Knowledge Base Reference: bmad/bmm/testarch/knowledge/fixture-architecture.md
 */
import { test as base, mergeTests } from '@playwright/test';
import { UserFactory } from './factories/user-factory';
import { CustomerFactory } from './factories/customer-factory';
import { authFixture, AuthFixture } from './auth-fixture';

/**
 * User Factory Fixture
 * Provides test data factories with auto-cleanup
 */
const userFactoryFixture = base.extend<{ userFactory: UserFactory }>({
  userFactory: async ({ request }, use) => {
    const factory = new UserFactory(request);
    await use(factory);
    // Auto-cleanup: Delete all created users after test
    await factory.cleanup();
  },
});

/**
 * Customer Factory Fixture
 * Provides customer test data factories with auto-cleanup
 * Now uses authenticated requests
 */
const customerFactoryFixture = base.extend<{ customerFactory: CustomerFactory }>({
  customerFactory: async ({ request, authCredentials }, use) => {
    // Create factory with auth token
    const factory = new CustomerFactory(request, authCredentials?.token);
    await use(factory);
    // Auto-cleanup: Delete all created customers after test
    await factory.cleanup();
  },
});

/**
 * Authenticated Page Fixture
 * Automatically sets token in localStorage before each test
 * This ensures pages are authenticated when they load
 * 
 * This fixture runs automatically for all tests that use the page fixture
 */
const authenticatedPageFixture = base.extend<{ page: any }>({
  page: async ({ page, authCredentials }, use) => {
    // Set auth token in localStorage before any navigation
    // This runs before page.goto() is called
    await page.addInitScript((token: string, email: string) => {
      if (token) {
        localStorage.setItem('authToken', token);
        localStorage.setItem('authEmail', email);
      }
    }, authCredentials?.token || '', authCredentials?.email || 'test@example.com');

    await use(page);
  },
});

/**
 * Merged Test Fixture
 * Compose all fixtures here for comprehensive test capabilities
 * 
 * To add more fixtures:
 * 1. Create fixture in fixtures/ directory
 * 2. Import it here
 * 3. Add to mergeTests() call
 */
export const test = mergeTests(
  base,
  authFixture,
  userFactoryFixture,
  customerFactoryFixture,
  authenticatedPageFixture
);

// Re-export expect for convenience
export { expect } from '@playwright/test';

