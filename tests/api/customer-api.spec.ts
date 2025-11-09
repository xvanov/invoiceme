/**
 * API Tests for Customer Management (Story 1.1)
 * 
 * These tests are in RED phase - they will fail until implementation is complete.
 * Following TDD red-green-refactor cycle.
 * 
 * Knowledge Base References:
 * - bmad/bmm/testarch/knowledge/test-quality.md
 * - bmad/bmm/testarch/knowledge/test-levels-framework.md
 */
import { test, expect } from '@playwright/test';
import { createCustomer } from '../support/factories/customer-factory';

test.describe('Customer API - Story 1.1', () => {
  const apiUrl = process.env.API_URL || 'http://localhost:8080/api';

  // AC #10: All integration tests for Customer API endpoints (POST, GET, PUT, DELETE) pass.
  
  // POST /api/customers - Create customer
  test('POST /api/customers - should create new customer', async ({ request }) => {
    // GIVEN: Valid customer data
    const customerData = createCustomer();

    // WHEN: Creating customer via API
    const response = await request.post(`${apiUrl}/customers`, {
      data: customerData,
    });

    // THEN: Customer is created successfully
    expect(response.status()).toBe(201);

    const createdCustomer = await response.json();
    expect(createdCustomer.id).toBeTruthy();
    expect(createdCustomer.name).toBe(customerData.name);
    expect(createdCustomer.email).toBe(customerData.email);

    // Cleanup
    await request.delete(`${apiUrl}/customers/${createdCustomer.id}`);
  });

  // GET /api/customers/{id} - Retrieve customer by ID
  test('GET /api/customers/{id} - should retrieve customer by ID', async ({ request }) => {
    // GIVEN: Customer exists in the system
    const customerData = createCustomer();
    const createResponse = await request.post(`${apiUrl}/customers`, {
      data: customerData,
    });
    const created = await createResponse.json();

    // WHEN: Retrieving customer by ID
    const response = await request.get(`${apiUrl}/customers/${created.id}`);

    // THEN: Customer information is returned
    expect(response.status()).toBe(200);

    const customer = await response.json();
    expect(customer.id).toBe(created.id);
    expect(customer.name).toBe(customerData.name);
    expect(customer.email).toBe(customerData.email);

    // Cleanup
    await request.delete(`${apiUrl}/customers/${created.id}`);
  });

  // GET /api/customers - List all customers
  test('GET /api/customers - should list all customers', async ({ request }) => {
    // GIVEN: Multiple customers exist in the system
    const customer1 = createCustomer({ name: 'Customer One', email: 'one@example.com' });
    const customer2 = createCustomer({ name: 'Customer Two', email: 'two@example.com' });

    const create1Response = await request.post(`${apiUrl}/customers`, { data: customer1 });
    const create2Response = await request.post(`${apiUrl}/customers`, { data: customer2 });
    const created1 = await create1Response.json();
    const created2 = await create2Response.json();

    // WHEN: Listing all customers
    const response = await request.get(`${apiUrl}/customers`);

    // THEN: All customers are returned
    expect(response.status()).toBe(200);

    const customers = await response.json();
    expect(Array.isArray(customers)).toBe(true);
    expect(customers.length).toBeGreaterThanOrEqual(2);

    const found1 = customers.find((c: any) => c.id === created1.id);
    const found2 = customers.find((c: any) => c.id === created2.id);

    expect(found1).toBeTruthy();
    expect(found1.name).toBe(customer1.name);
    expect(found2).toBeTruthy();
    expect(found2.name).toBe(customer2.name);

    // Cleanup
    await request.delete(`${apiUrl}/customers/${created1.id}`);
    await request.delete(`${apiUrl}/customers/${created2.id}`);
  });

  // PUT /api/customers/{id} - Update customer
  test('PUT /api/customers/{id} - should update customer information', async ({ request }) => {
    // GIVEN: Customer exists in the system
    const customerData = createCustomer();
    const createResponse = await request.post(`${apiUrl}/customers`, {
      data: customerData,
    });
    const created = await createResponse.json();

    const updatedData = {
      name: 'Updated Name',
      email: 'updated@example.com',
    };

    // WHEN: Updating customer
    const response = await request.put(`${apiUrl}/customers/${created.id}`, {
      data: updatedData,
    });

    // THEN: Customer is updated successfully
    expect(response.status()).toBe(200);

    const updated = await response.json();
    expect(updated.id).toBe(created.id);
    expect(updated.name).toBe(updatedData.name);
    expect(updated.email).toBe(updatedData.email);

    // Verify changes persisted
    const getResponse = await request.get(`${apiUrl}/customers/${created.id}`);
    const retrieved = await getResponse.json();
    expect(retrieved.name).toBe(updatedData.name);
    expect(retrieved.email).toBe(updatedData.email);

    // Cleanup
    await request.delete(`${apiUrl}/customers/${created.id}`);
  });

  // DELETE /api/customers/{id} - Delete customer
  test('DELETE /api/customers/{id} - should delete customer', async ({ request }) => {
    // GIVEN: Customer exists in the system
    const customerData = createCustomer();
    const createResponse = await request.post(`${apiUrl}/customers`, {
      data: customerData,
    });
    const created = await createResponse.json();

    // WHEN: Deleting customer
    const response = await request.delete(`${apiUrl}/customers/${created.id}`);

    // THEN: Customer is deleted successfully
    expect(response.status()).toBe(200);

    // Verify customer no longer exists
    const getResponse = await request.get(`${apiUrl}/customers/${created.id}`);
    expect(getResponse.status()).toBe(404);
  });

  // Validation: Empty name
  test('POST /api/customers - should reject customer with empty name', async ({ request }) => {
    // GIVEN: Customer data with empty name
    const customerData = createCustomer({ name: '' });

    // WHEN: Creating customer with invalid data
    const response = await request.post(`${apiUrl}/customers`, {
      data: customerData,
    });

    // THEN: Request is rejected with validation error
    expect(response.status()).toBe(400);

    const error = await response.json();
    expect(error.message).toMatch(/name|required/i);
  });

  // Validation: Invalid email
  test('POST /api/customers - should reject customer with invalid email', async ({ request }) => {
    // GIVEN: Customer data with invalid email
    const customerData = createCustomer({ email: 'invalid-email' });

    // WHEN: Creating customer with invalid data
    const response = await request.post(`${apiUrl}/customers`, {
      data: customerData,
    });

    // THEN: Request is rejected with validation error
    expect(response.status()).toBe(400);

    const error = await response.json();
    expect(error.message).toMatch(/email|invalid/i);
  });

  // Not found: GET non-existent customer
  test('GET /api/customers/{id} - should return 404 for non-existent customer', async ({ request }) => {
    // GIVEN: Non-existent customer ID
    const nonExistentId = '00000000-0000-0000-0000-000000000000';

    // WHEN: Retrieving non-existent customer
    const response = await request.get(`${apiUrl}/customers/${nonExistentId}`);

    // THEN: 404 Not Found is returned
    expect(response.status()).toBe(404);
  });
});

