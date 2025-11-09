/**
 * User Factory - Test Data Factory with Auto-Cleanup
 * 
 * This factory follows the data factory pattern:
 * - Uses faker for realistic, parallel-safe data
 * - Accepts overrides to show test intent
 * - Tracks created entities for automatic cleanup
 * 
 * Knowledge Base Reference: bmad/bmm/testarch/knowledge/data-factories.md
 */
import { APIRequestContext } from '@playwright/test';
import { faker } from '@faker-js/faker';

export type User = {
  id: string;
  email: string;
  name: string;
  role?: 'user' | 'admin' | 'moderator';
  createdAt?: Date;
  isActive?: boolean;
};

export class UserFactory {
  private createdUsers: string[] = [];
  private apiUrl: string;

  constructor(private request: APIRequestContext) {
    this.apiUrl = process.env.API_URL || 'http://localhost:8080/api';
  }

  /**
   * Create a user with sensible defaults and optional overrides
   * 
   * @param overrides - Partial user data to override defaults
   * @returns Created user with server-assigned ID
   */
  async createUser(overrides: Partial<User> = {}): Promise<User> {
    const user: Partial<User> = {
      email: faker.internet.email(),
      name: faker.person.fullName(),
      role: 'user',
      isActive: true,
      ...overrides,
    };

    // Seed via API (fast, parallel-safe)
    const response = await this.request.post(`${this.apiUrl}/customers`, {
      data: user,
    });

    if (!response.ok()) {
      const errorText = await response.text();
      throw new Error(`Failed to create user: ${response.status()} ${errorText}`);
    }

    const created = await response.json();
    this.createdUsers.push(created.id);
    return created;
  }

  /**
   * Create an admin user (convenience method)
   */
  async createAdminUser(overrides: Partial<User> = {}): Promise<User> {
    return this.createUser({ role: 'admin', ...overrides });
  }

  /**
   * Cleanup: Delete all users created during test
   * Called automatically by fixture teardown
   */
  async cleanup(): Promise<void> {
    for (const userId of this.createdUsers) {
      try {
        await this.request.delete(`${this.apiUrl}/customers/${userId}`);
      } catch (error) {
        // Ignore cleanup errors (user may already be deleted)
        console.warn(`Failed to cleanup user ${userId}:`, error);
      }
    }
    this.createdUsers = [];
  }
}


