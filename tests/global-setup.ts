/**
 * Global Setup - Create Test User for E2E Tests
 * 
 * This script runs once before all tests to ensure the test user exists.
 * It creates the test user if it doesn't exist.
 * 
 * Knowledge Base Reference: bmad/bmm/testarch/knowledge/fixture-architecture.md
 */
import { APIRequestContext, chromium } from '@playwright/test';

async function globalSetup() {
  const apiUrl = process.env.API_URL || 'http://localhost:8080/api';
  const email = 'test@example.com';
  const password = 'password123';

  // Create a browser context to make API requests
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const request = context.request;

  try {
    // Try to login first (user might already exist)
    const loginResponse = await request.post(`${apiUrl}/auth/login`, {
      data: { email, password },
    });

    if (loginResponse.ok()) {
      console.log('✅ Test user already exists and can login');
      await browser.close();
      return;
    }

    // If login fails, user doesn't exist
    // Note: There's no registration endpoint, so user must be created manually
    console.warn('⚠️  Test user does not exist!');
    console.warn('⚠️  Please create test user manually before running E2E tests:');
    console.warn(`   Email: ${email}`);
    console.warn(`   Password: ${password}`);
    console.warn('');
    console.warn('Options to create test user:');
    console.warn('  1. Run integration test: ./mvnw test -Dtest=CustomerInvoicePaymentFlowTest');
    console.warn('  2. Use H2 Console: http://localhost:8080/h2-console');
    console.warn('  3. Run helper script: ./tests/create-test-user.sh');
    console.warn('');
    console.warn('⚠️  E2E tests will fail without the test user!');
  } catch (error) {
    console.error('❌ Error during global setup:', error);
    console.warn('⚠️  Please ensure:');
    console.warn('   1. Backend is running on http://localhost:8080');
    console.warn('   2. Test user exists (email: test@example.com, password: password123)');
    console.warn('   3. User can be created via database or registration endpoint');
  } finally {
    await browser.close();
  }
}

export default globalSetup;

