# ATDD Checklist - Epic 1, Story 1.1: Foundation Setup + Customer Management

**Date:** 2025-11-09
**Author:** BMad
**Primary Test Level:** E2E + API

---

## Story Summary

As a **business user**, I want **to manage customer records (create, view, update, delete)**, So that **I can maintain accurate customer information for invoicing**.

This story establishes the foundation for the InvoiceMe application by implementing the first vertical slice (Customer Management) following DDD, CQRS, VSA, and Clean Architecture patterns.

---

## Acceptance Criteria

1. **AC #1:** Given a user is on the customer list page, when they click "Create Customer", then a form is displayed with fields for name and email.
2. **AC #2:** Given a user submits a valid customer form (name and email provided), when they click "Save", then the customer is created and persisted in the database, and the user is redirected to the customer list with a success message.
3. **AC #3:** Given a customer exists in the system, when a user views the customer list, then all customers are displayed in a table with name and email columns.
4. **AC #4:** Given a customer exists in the system, when a user clicks on a customer in the list, then the customer detail page is displayed with all customer information.
5. **AC #5:** Given a user is viewing a customer detail page, when they click "Edit", then the customer form is displayed pre-filled with existing data.
6. **AC #6:** Given a user submits an updated customer form, when they click "Save", then the customer information is updated in the database, and changes are reflected when the customer is retrieved.
7. **AC #7:** Given a customer exists in the system, when a user clicks "Delete" and confirms, then the customer is removed from the database, and the user is redirected to the customer list.
8. **AC #8:** Given invalid customer data (empty name or invalid email), when a user submits the form, then validation errors are displayed, and the customer is not created/updated.
9. **AC #9:** All backend unit tests for Customer domain entity pass with 80%+ coverage.
10. **AC #10:** All integration tests for Customer API endpoints (POST, GET, PUT, DELETE) pass.
11. **AC #11:** E2E test for customer management flow (create → view → edit → delete) passes.

---

## Failing Tests Created (RED Phase)

### E2E Tests (9 tests)

**File:** `tests/e2e/customer-management.spec.ts` (350 lines)

- ✅ **Test:** should display create customer form when clicking Create Customer
  - **Status:** RED - Missing `/customers` route, missing `create-customer-button`, missing form fields
  - **Verifies:** AC #1 - Create customer form display

- ✅ **Test:** should create customer and redirect to list with success message
  - **Status:** RED - Missing POST `/api/customers` endpoint, missing form submission, missing redirect logic
  - **Verifies:** AC #2 - Customer creation and persistence

- ✅ **Test:** should display all customers in table with name and email columns
  - **Status:** RED - Missing GET `/api/customers` endpoint, missing customer list page, missing table component
  - **Verifies:** AC #3 - Customer list display

- ✅ **Test:** should display customer detail page when clicking on customer in list
  - **Status:** RED - Missing GET `/api/customers/{id}` endpoint, missing detail page route, missing customer row click handler
  - **Verifies:** AC #4 - Customer detail page display

- ✅ **Test:** should display edit form pre-filled with existing customer data
  - **Status:** RED - Missing edit button, missing pre-filled form logic, missing GET customer data
  - **Verifies:** AC #5 - Edit form pre-filling

- ✅ **Test:** should update customer information and reflect changes
  - **Status:** RED - Missing PUT `/api/customers/{id}` endpoint, missing update logic, missing change reflection
  - **Verifies:** AC #6 - Customer update functionality

- ✅ **Test:** should delete customer and redirect to list
  - **Status:** RED - Missing DELETE `/api/customers/{id}` endpoint, missing delete button, missing confirmation dialog
  - **Verifies:** AC #7 - Customer deletion

- ✅ **Test:** should display validation errors for invalid customer data
  - **Status:** RED - Missing form validation, missing error display components, missing validation error messages
  - **Verifies:** AC #8 - Form validation

- ✅ **Test:** should complete full customer management flow
  - **Status:** RED - Missing complete flow implementation (create → view → edit → delete)
  - **Verifies:** AC #11 - Complete customer management flow

### API Tests (8 tests)

**File:** `tests/api/customer-api.spec.ts` (220 lines)

- ✅ **Test:** POST /api/customers - should create new customer
  - **Status:** RED - Missing POST `/api/customers` endpoint implementation
  - **Verifies:** AC #10 - Customer creation API

- ✅ **Test:** GET /api/customers/{id} - should retrieve customer by ID
  - **Status:** RED - Missing GET `/api/customers/{id}` endpoint implementation
  - **Verifies:** AC #10 - Customer retrieval API

- ✅ **Test:** GET /api/customers - should list all customers
  - **Status:** RED - Missing GET `/api/customers` endpoint implementation
  - **Verifies:** AC #10 - Customer list API

- ✅ **Test:** PUT /api/customers/{id} - should update customer information
  - **Status:** RED - Missing PUT `/api/customers/{id}` endpoint implementation
  - **Verifies:** AC #10 - Customer update API

- ✅ **Test:** DELETE /api/customers/{id} - should delete customer
  - **Status:** RED - Missing DELETE `/api/customers/{id}` endpoint implementation
  - **Verifies:** AC #10 - Customer deletion API

- ✅ **Test:** POST /api/customers - should reject customer with empty name
  - **Status:** RED - Missing validation logic for empty name
  - **Verifies:** AC #8 - Validation for empty name

- ✅ **Test:** POST /api/customers - should reject customer with invalid email
  - **Status:** RED - Missing validation logic for invalid email
  - **Verifies:** AC #8 - Validation for invalid email

- ✅ **Test:** GET /api/customers/{id} - should return 404 for non-existent customer
  - **Status:** RED - Missing 404 error handling for non-existent customer
  - **Verifies:** AC #10 - Error handling for non-existent customer

---

## Data Factories Created

### Customer Factory

**File:** `tests/support/factories/customer-factory.ts`

**Exports:**

- `createCustomer(overrides?)` - Create single customer with optional overrides
- `createCustomers(count)` - Create array of customers

**Example Usage:**

```typescript
const customer = createCustomer({ email: 'specific@example.com' });
const customers = createCustomers(5); // Generate 5 random customers
```

### Customer Factory (Fixture)

**File:** `tests/support/fixtures/factories/customer-factory.ts`

**Exports:**

- `CustomerFactory` class with `createCustomer()` and `createCustomers()` methods
- Auto-cleanup via fixture teardown

**Example Usage:**

```typescript
test('should create customer', async ({ customerFactory }) => {
  const customer = await customerFactory.createCustomer({ name: 'Acme Corp' });
  // customerFactory.cleanup() called automatically after test
});
```

---

## Fixtures Created

### Customer Factory Fixtures

**File:** `tests/support/fixtures/index.ts`

**Fixtures:**

- `customerFactory` - Provides CustomerFactory with auto-cleanup
  - **Setup:** Creates CustomerFactory instance with API request context
  - **Provides:** CustomerFactory with `createCustomer()` and `createCustomers()` methods
  - **Cleanup:** Automatically deletes all customers created during test

**Example Usage:**

```typescript
import { test } from '../support/fixtures';

test('should create customer', async ({ customerFactory }) => {
  // customerFactory is ready to use with auto-cleanup
  const customer = await customerFactory.createCustomer({ name: 'Acme Corp' });
});
```

---

## Mock Requirements

No external services require mocking for this story. All tests use the actual API endpoints.

---

## Required data-testid Attributes

### Customer List Page

- `create-customer-button` - Button to open create customer form
- `customers-table` - Table container displaying customers
- `customer-name-column` - Column header for customer name
- `customer-email-column` - Column header for customer email
- `customer-row-{id}` - Row for specific customer (e.g., `customer-row-123`)

### Customer Form (Create/Edit)

- `customer-name-input` - Input field for customer name
- `customer-email-input` - Input field for customer email
- `save-customer-button` - Button to save customer
- `customer-name-error` - Error message for name validation
- `customer-email-error` - Error message for email validation

### Customer Detail Page

- `edit-customer-button` - Button to edit customer
- `delete-customer-button` - Button to delete customer

### Success/Error Messages

- `success-message` - Container for success messages

**Implementation Example:**

```tsx
<button data-testid="create-customer-button">Create Customer</button>
<input data-testid="customer-name-input" type="text" />
<input data-testid="customer-email-input" type="email" />
<button data-testid="save-customer-button">Save</button>
<div data-testid="success-message">{successText}</div>
<div data-testid="customer-name-error">{errorText}</div>
```

---

## Implementation Checklist

### Test: should display create customer form when clicking Create Customer

**File:** `tests/e2e/customer-management.spec.ts`

**Tasks to make this test pass:**

- [ ] Create `/customers` route in Next.js
- [ ] Implement customer list page component
- [ ] Add `data-testid="create-customer-button"` to create button
- [ ] Create `/customers/new` route for create form
- [ ] Implement customer form component with name and email fields
- [ ] Add `data-testid="customer-name-input"` to name input
- [ ] Add `data-testid="customer-email-input"` to email input
- [ ] Add `data-testid="save-customer-button"` to save button
- [ ] Run test: `npm run test:e2e -- customer-management.spec.ts`
- [ ] ✅ Test passes (green phase)

**Estimated Effort:** 2 hours

---

### Test: should create customer and redirect to list with success message

**File:** `tests/e2e/customer-management.spec.ts`

**Tasks to make this test pass:**

- [ ] Implement POST `/api/customers` endpoint in backend
- [ ] Create CustomerController with POST endpoint
- [ ] Implement CreateCustomerCommand and handler (CQRS)
- [ ] Create Customer domain entity
- [ ] Implement CustomerRepository for persistence
- [ ] Create database migration for customers table
- [ ] Implement form submission handler in frontend
- [ ] Add redirect logic after successful creation
- [ ] Implement success message display
- [ ] Add `data-testid="success-message"` to success message container
- [ ] Run test: `npm run test:e2e -- customer-management.spec.ts`
- [ ] ✅ Test passes (green phase)

**Estimated Effort:** 4 hours

---

### Test: should display all customers in table with name and email columns

**File:** `tests/e2e/customer-management.spec.ts`

**Tasks to make this test pass:**

- [ ] Implement GET `/api/customers` endpoint in backend
- [ ] Create ListCustomersQuery and handler (CQRS)
- [ ] Implement customer list page with table component
- [ ] Add `data-testid="customers-table"` to table
- [ ] Add `data-testid="customer-name-column"` to name column header
- [ ] Add `data-testid="customer-email-column"` to email column header
- [ ] Implement useCustomers hook to fetch customers
- [ ] Display customers in table rows
- [ ] Run test: `npm run test:e2e -- customer-management.spec.ts`
- [ ] ✅ Test passes (green phase)

**Estimated Effort:** 3 hours

---

### Test: should display customer detail page when clicking on customer in list

**File:** `tests/e2e/customer-management.spec.ts`

**Tasks to make this test pass:**

- [ ] Implement GET `/api/customers/{id}` endpoint in backend
- [ ] Create GetCustomerQuery and handler (CQRS)
- [ ] Create `/customers/[id]` route in Next.js
- [ ] Implement customer detail page component
- [ ] Add `data-testid="customer-row-{id}"` to customer rows in list
- [ ] Implement click handler to navigate to detail page
- [ ] Display customer information on detail page
- [ ] Run test: `npm run test:e2e -- customer-management.spec.ts`
- [ ] ✅ Test passes (green phase)

**Estimated Effort:** 2 hours

---

### Test: should display edit form pre-filled with existing customer data

**File:** `tests/e2e/customer-management.spec.ts`

**Tasks to make this test pass:**

- [ ] Add `data-testid="edit-customer-button"` to edit button on detail page
- [ ] Implement edit button click handler
- [ ] Navigate to edit form (or show inline edit form)
- [ ] Pre-fill form fields with existing customer data
- [ ] Verify form fields have correct values
- [ ] Run test: `npm run test:e2e -- customer-management.spec.ts`
- [ ] ✅ Test passes (green phase)

**Estimated Effort:** 1 hour

---

### Test: should update customer information and reflect changes

**File:** `tests/e2e/customer-management.spec.ts`

**Tasks to make this test pass:**

- [ ] Implement PUT `/api/customers/{id}` endpoint in backend
- [ ] Create UpdateCustomerCommand and handler (CQRS)
- [ ] Implement form submission handler for update
- [ ] Update customer in database
- [ ] Refresh customer detail page to show updated data
- [ ] Verify changes are reflected
- [ ] Run test: `npm run test:e2e -- customer-management.spec.ts`
- [ ] ✅ Test passes (green phase)

**Estimated Effort:** 2 hours

---

### Test: should delete customer and redirect to list

**File:** `tests/e2e/customer-management.spec.ts`

**Tasks to make this test pass:**

- [ ] Implement DELETE `/api/customers/{id}` endpoint in backend
- [ ] Create DeleteCustomerCommand and handler (CQRS)
- [ ] Add `data-testid="delete-customer-button"` to delete button
- [ ] Implement confirmation dialog
- [ ] Implement delete handler
- [ ] Delete customer from database
- [ ] Redirect to customer list after deletion
- [ ] Verify customer removed from list
- [ ] Run test: `npm run test:e2e -- customer-management.spec.ts`
- [ ] ✅ Test passes (green phase)

**Estimated Effort:** 2 hours

---

### Test: should display validation errors for invalid customer data

**File:** `tests/e2e/customer-management.spec.ts`

**Tasks to make this test pass:**

- [ ] Implement form validation in frontend (Zod schema)
- [ ] Add validation for empty name
- [ ] Add validation for invalid email format
- [ ] Add `data-testid="customer-name-error"` to name error container
- [ ] Add `data-testid="customer-email-error"` to email error container
- [ ] Display validation errors when form is invalid
- [ ] Prevent form submission when validation fails
- [ ] Run test: `npm run test:e2e -- customer-management.spec.ts`
- [ ] ✅ Test passes (green phase)

**Estimated Effort:** 2 hours

---

### Test: should complete full customer management flow

**File:** `tests/e2e/customer-management.spec.ts`

**Tasks to make this test pass:**

- [ ] Ensure all previous tests pass (create, view, edit, delete)
- [ ] Verify complete flow works end-to-end
- [ ] Run test: `npm run test:e2e -- customer-management.spec.ts`
- [ ] ✅ Test passes (green phase)

**Estimated Effort:** 1 hour

---

### Test: POST /api/customers - should create new customer

**File:** `tests/api/customer-api.spec.ts`

**Tasks to make this test pass:**

- [ ] Implement POST `/api/customers` endpoint
- [ ] Create CustomerController with POST handler
- [ ] Implement CreateCustomerCommand and handler
- [ ] Create Customer domain entity
- [ ] Implement CustomerRepository
- [ ] Create database migration
- [ ] Return 201 status with created customer
- [ ] Run test: `npm run test:api -- customer-api.spec.ts`
- [ ] ✅ Test passes (green phase)

**Estimated Effort:** 3 hours

---

### Test: GET /api/customers/{id} - should retrieve customer by ID

**File:** `tests/api/customer-api.spec.ts`

**Tasks to make this test pass:**

- [ ] Implement GET `/api/customers/{id}` endpoint
- [ ] Create GetCustomerQuery and handler
- [ ] Retrieve customer from database
- [ ] Return 200 status with customer data
- [ ] Run test: `npm run test:api -- customer-api.spec.ts`
- [ ] ✅ Test passes (green phase)

**Estimated Effort:** 1 hour

---

### Test: GET /api/customers - should list all customers

**File:** `tests/api/customer-api.spec.ts`

**Tasks to make this test pass:**

- [ ] Implement GET `/api/customers` endpoint
- [ ] Create ListCustomersQuery and handler
- [ ] Retrieve all customers from database
- [ ] Return 200 status with customer array
- [ ] Run test: `npm run test:api -- customer-api.spec.ts`
- [ ] ✅ Test passes (green phase)

**Estimated Effort:** 1 hour

---

### Test: PUT /api/customers/{id} - should update customer information

**File:** `tests/api/customer-api.spec.ts`

**Tasks to make this test pass:**

- [ ] Implement PUT `/api/customers/{id}` endpoint
- [ ] Create UpdateCustomerCommand and handler
- [ ] Update customer in database
- [ ] Return 200 status with updated customer
- [ ] Run test: `npm run test:api -- customer-api.spec.ts`
- [ ] ✅ Test passes (green phase)

**Estimated Effort:** 1 hour

---

### Test: DELETE /api/customers/{id} - should delete customer

**File:** `tests/api/customer-api.spec.ts`

**Tasks to make this test pass:**

- [ ] Implement DELETE `/api/customers/{id}` endpoint
- [ ] Create DeleteCustomerCommand and handler
- [ ] Delete customer from database
- [ ] Return 200 status
- [ ] Verify customer no longer exists (404 on GET)
- [ ] Run test: `npm run test:api -- customer-api.spec.ts`
- [ ] ✅ Test passes (green phase)

**Estimated Effort:** 1 hour

---

### Test: POST /api/customers - should reject customer with empty name

**File:** `tests/api/customer-api.spec.ts`

**Tasks to make this test pass:**

- [ ] Add validation for empty name in backend
- [ ] Return 400 status with validation error message
- [ ] Error message should contain "name" or "required"
- [ ] Run test: `npm run test:api -- customer-api.spec.ts`
- [ ] ✅ Test passes (green phase)

**Estimated Effort:** 1 hour

---

### Test: POST /api/customers - should reject customer with invalid email

**File:** `tests/api/customer-api.spec.ts`

**Tasks to make this test pass:**

- [ ] Add validation for email format in backend
- [ ] Return 400 status with validation error message
- [ ] Error message should contain "email" or "invalid"
- [ ] Run test: `npm run test:api -- customer-api.spec.ts`
- [ ] ✅ Test passes (green phase)

**Estimated Effort:** 1 hour

---

### Test: GET /api/customers/{id} - should return 404 for non-existent customer

**File:** `tests/api/customer-api.spec.ts`

**Tasks to make this test pass:**

- [ ] Add error handling for non-existent customer
- [ ] Return 404 status when customer not found
- [ ] Run test: `npm run test:api -- customer-api.spec.ts`
- [ ] ✅ Test passes (green phase)

**Estimated Effort:** 1 hour

---

## Running Tests

```bash
# Run all failing tests for this story
npm run test:e2e
npm run test:api

# Run specific test file
npm run test:e2e -- customer-management.spec.ts
npm run test:api -- customer-api.spec.ts

# Run tests in headed mode (see browser)
npm run test:e2e -- --headed

# Debug specific test
npm run test:e2e -- customer-management.spec.ts --debug

# Run tests with coverage
npm run test:api -- --coverage
```

---

## Red-Green-Refactor Workflow

### RED Phase (Complete) ✅

**TEA Agent Responsibilities:**

- ✅ All tests written and failing
- ✅ Fixtures and factories created with auto-cleanup
- ✅ Mock requirements documented (none required)
- ✅ data-testid requirements listed
- ✅ Implementation checklist created

**Verification:**

- All tests run and fail as expected
- Failure messages are clear and actionable
- Tests fail due to missing implementation, not test bugs

---

### GREEN Phase (DEV Team - Next Steps)

**DEV Agent Responsibilities:**

1. **Pick one failing test** from implementation checklist (start with highest priority)
2. **Read the test** to understand expected behavior
3. **Implement minimal code** to make that specific test pass
4. **Run the test** to verify it now passes (green)
5. **Check off the task** in implementation checklist
6. **Move to next test** and repeat

**Key Principles:**

- One test at a time (don't try to fix all at once)
- Minimal implementation (don't over-engineer)
- Run tests frequently (immediate feedback)
- Use implementation checklist as roadmap

**Progress Tracking:**

- Check off tasks as you complete them
- Share progress in daily standup
- Mark story as IN PROGRESS in workflow status

---

### REFACTOR Phase (DEV Team - After All Tests Pass)

**DEV Agent Responsibilities:**

1. **Verify all tests pass** (green phase complete)
2. **Review code for quality** (readability, maintainability, performance)
3. **Extract duplications** (DRY principle)
4. **Optimize performance** (if needed)
5. **Ensure tests still pass** after each refactor
6. **Update documentation** (if API contracts change)

**Key Principles:**

- Tests provide safety net (refactor with confidence)
- Make small refactors (easier to debug if tests fail)
- Run tests after each change
- Don't change test behavior (only implementation)

**Completion:**

- All tests pass
- Code quality meets team standards
- No duplications or code smells
- Ready for code review and story approval

---

## Next Steps

1. **Review this checklist** with team in standup or planning
2. **Run failing tests** to confirm RED phase: `npm run test:e2e && npm run test:api`
3. **Begin implementation** using implementation checklist as guide
4. **Work one test at a time** (red → green for each)
5. **Share progress** in daily standup
6. **When all tests pass**, refactor code for quality
7. **When refactoring complete**, run `bmad sm story-done` to move story to DONE

---

## Knowledge Base References Applied

This ATDD workflow consulted the following knowledge fragments:

- **fixture-architecture.md** - Test fixture patterns with setup/teardown and auto-cleanup using Playwright's `test.extend()`
- **data-factories.md** - Factory patterns using `@faker-js/faker` for random test data generation with overrides support
- **network-first.md** - Route interception patterns (intercept BEFORE navigation to prevent race conditions)
- **test-quality.md** - Test design principles (Given-When-Then, one assertion per test, determinism, isolation)
- **test-levels-framework.md** - Test level selection framework (E2E vs API vs Component vs Unit)

See `tea-index.csv` for complete knowledge fragment mapping.

---

## Test Execution Evidence

### Initial Test Run (RED Phase Verification)

**Command:** `npm run test:e2e && npm run test:api`

**Expected Results:**

```
Running 9 E2E tests...
✗ should display create customer form when clicking Create Customer (FAILED)
✗ should create customer and redirect to list with success message (FAILED)
✗ should display all customers in table with name and email columns (FAILED)
✗ should display customer detail page when clicking on customer in list (FAILED)
✗ should display edit form pre-filled with existing customer data (FAILED)
✗ should update customer information and reflect changes (FAILED)
✗ should delete customer and redirect to list (FAILED)
✗ should display validation errors for invalid customer data (FAILED)
✗ should complete full customer management flow (FAILED)

Running 8 API tests...
✗ POST /api/customers - should create new customer (FAILED)
✗ GET /api/customers/{id} - should retrieve customer by ID (FAILED)
✗ GET /api/customers - should list all customers (FAILED)
✗ PUT /api/customers/{id} - should update customer information (FAILED)
✗ DELETE /api/customers/{id} - should delete customer (FAILED)
✗ POST /api/customers - should reject customer with empty name (FAILED)
✗ POST /api/customers - should reject customer with invalid email (FAILED)
✗ GET /api/customers/{id} - should return 404 for non-existent customer (FAILED)
```

**Summary:**

- Total tests: 17
- Passing: 0 (expected)
- Failing: 17 (expected)
- Status: ✅ RED phase verified

**Expected Failure Messages:**

- E2E tests: "Error: page.goto: net::ERR_CONNECTION_REFUSED" (backend not running)
- E2E tests: "Error: locator not found" (UI components not implemented)
- API tests: "Error: Request failed with status code 404" (endpoints not implemented)

---

## Notes

- All tests follow network-first pattern (intercept before navigation)
- All tests use data-testid selectors for stability
- All tests use factories with faker for parallel-safe data
- All fixtures have auto-cleanup to prevent state pollution
- Tests are organized by acceptance criteria for traceability

---

## Contact

**Questions or Issues?**

- Ask in team standup
- Tag @tea in Slack/Discord
- Refer to `./bmad/bmm/docs/tea-README.md` for workflow documentation
- Consult `./bmad/bmm/testarch/knowledge` for testing best practices

---

**Generated by BMad TEA Agent** - 2025-11-09


