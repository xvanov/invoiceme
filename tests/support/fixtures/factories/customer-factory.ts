/**
 * Customer Factory - Test Data Factory with Auto-Cleanup
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

export type Customer = {
  id: string;
  name: string;
  email: string;
  createdAt?: Date;
};

export class CustomerFactory {
  private createdCustomers: string[] = [];
  private apiUrl: string;
  private authToken?: string;

  constructor(private request: APIRequestContext, authToken?: string) {
    this.apiUrl = process.env.API_URL || 'http://localhost:8080/api';
    this.authToken = authToken;
  }

  /**
   * Create a customer with sensible defaults and optional overrides
   * 
   * @param overrides - Partial customer data to override defaults
   * @returns Created customer with server-assigned ID
   */
  async createCustomer(overrides: Partial<Customer> = {}): Promise<Customer> {
    // Generate unique email if not provided to avoid collisions
    const defaultEmail = overrides.email || `${faker.internet.email().split('@')[0]}-${Date.now()}-${Math.random().toString(36).substring(7)}@${faker.internet.email().split('@')[1]}`;
    
    const customer: Partial<Customer> = {
      name: faker.company.name(),
      email: defaultEmail,
      ...overrides,
    };

    // Prepare headers with auth token if available
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    // Seed via API (fast, parallel-safe)
    const response = await this.request.post(`${this.apiUrl}/customers`, {
      data: customer,
      headers,
    });

    if (!response.ok()) {
      const errorText = await response.text();
      throw new Error(`Failed to create customer: ${response.status()} ${errorText}`);
    }

    const created = await response.json();
    this.createdCustomers.push(created.id);
    return created;
  }

  /**
   * Create multiple customers
   * 
   * @param count - Number of customers to create
   * @param overrides - Partial customer data to override defaults for all
   * @returns Array of created customers
   */
  async createCustomers(count: number, overrides: Partial<Customer> = {}): Promise<Customer[]> {
    const customers: Customer[] = [];
    for (let i = 0; i < count; i++) {
      const customer = await this.createCustomer(overrides);
      customers.push(customer);
    }
    return customers;
  }

  /**
   * Cleanup: Delete all customers created during test
   * Called automatically by fixture teardown
   */
  async cleanup(): Promise<void> {
    // Prepare headers with auth token if available
    const headers: Record<string, string> = {};
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    for (const customerId of this.createdCustomers) {
      try {
        await this.request.delete(`${this.apiUrl}/customers/${customerId}`, {
          headers,
        });
      } catch (error) {
        // Ignore cleanup errors (customer may already be deleted)
        console.warn(`Failed to cleanup customer ${customerId}:`, error);
      }
    }
    this.createdCustomers = [];
  }
}


