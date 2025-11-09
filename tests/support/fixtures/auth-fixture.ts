/**
 * Authentication Fixture - Auto-login for E2E Tests
 * 
 * This fixture automatically logs in before each test and provides:
 * - Authenticated page context (with token in localStorage)
 * - Authenticated API request context (with Bearer token)
 * - Test user credentials
 * 
 * Knowledge Base Reference: bmad/bmm/testarch/knowledge/fixture-architecture.md
 */
import { test as base } from '@playwright/test';

export type AuthCredentials = {
  email: string;
  password: string;
  token: string;
};

export type AuthFixture = {
  authCredentials: AuthCredentials;
};

/**
 * Authentication Fixture
 * Automatically logs in before each test and provides authenticated contexts
 */
export const authFixture = base.extend<AuthFixture>({
  authCredentials: async ({ request }, use) => {
    const apiUrl = process.env.API_URL || 'http://localhost:8080/api';
    const email = 'test@example.com';
    const password = 'password123';

    // Login to get token
    const loginResponse = await request.post(`${apiUrl}/auth/login`, {
      data: { email, password },
    });

    if (!loginResponse.ok()) {
      const errorText = await loginResponse.text();
      throw new Error(`Failed to login test user: ${loginResponse.status()} ${errorText}. Make sure test user exists (email: ${email}, password: ${password})`);
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;

    if (!token) {
      throw new Error(`Login succeeded but no token received. Response: ${JSON.stringify(loginData)}`);
    }

    const credentials: AuthCredentials = {
      email,
      password,
      token,
    };

    await use(credentials);
  },
});

