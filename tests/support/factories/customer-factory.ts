/**
 * Customer Factory - Test Data Factory
 * 
 * This factory follows the data factory pattern:
 * - Uses faker for realistic, parallel-safe data
 * - Accepts overrides to show test intent
 * - Pure function (no framework dependencies)
 * 
 * Knowledge Base Reference: bmad/bmm/testarch/knowledge/data-factories.md
 */
import { faker } from '@faker-js/faker';

export type Customer = {
  id?: string;
  name: string;
  email: string;
  createdAt?: Date;
};

/**
 * Create a customer with sensible defaults and optional overrides
 * 
 * @param overrides - Partial customer data to override defaults
 * @returns Customer object with generated data
 */
export const createCustomer = (overrides: Partial<Customer> = {}): Customer => {
  // Generate unique email if not provided to avoid collisions in parallel tests
  const defaultEmail = overrides.email || `${faker.internet.email().split('@')[0]}-${Date.now()}-${Math.random().toString(36).substring(7)}@${faker.internet.email().split('@')[1]}`;
  
  return {
    name: faker.company.name(),
    email: defaultEmail,
    ...overrides,
  };
};

/**
 * Create multiple customers
 * 
 * @param count - Number of customers to create
 * @param overrides - Partial customer data to override defaults for all
 * @returns Array of customer objects
 */
export const createCustomers = (count: number, overrides: Partial<Customer> = {}): Customer[] => {
  return Array.from({ length: count }, () => createCustomer(overrides));
};


