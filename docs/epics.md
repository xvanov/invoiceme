# InvoiceMe - Epic Breakdown

**Date:** 2025-11-09
**Project Level:** 1

---

## Epic 1: MVP Invoicing System

**Slug:** mvp-invoicing-system

### Goal

Deliver a complete, working invoicing system that demonstrates enterprise-grade architecture patterns (DDD, CQRS, VSA, Clean Architecture) while providing core business functionality for customer management, invoice lifecycle, and payment processing.

### Scope

**In Scope:**
- Customer Management: Full CRUD operations for customers
- Invoice Management: Create invoices with line items, manage lifecycle (Draft → Sent → Paid)
- Payment Processing: Record payments, update invoice balances, trigger state transitions
- User Authentication: Basic login functionality to secure application access
- Integration Testing: End-to-end tests verifying complete Customer → Invoice → Payment flow

**Out of Scope:**
- Advanced invoice features (templates, recurring invoices)
- Payment enhancements (partial payments, payment methods)
- Reporting and analytics
- Multi-tenant support
- Mobile applications

### Success Criteria

- ✅ All 19 functional requirements (FR-001 through FR-019) implemented and working
- ✅ Complete Customer → Invoice → Payment flow demonstrable end-to-end
- ✅ Invoice lifecycle state transitions enforced correctly (Draft → Sent → Paid)
- ✅ Balance calculations accurate throughout invoice lifecycle
- ✅ All API endpoints secured with authentication
- ✅ Integration tests pass for complete business flow
- ✅ System demonstrates DDD, CQRS, VSA, and Clean Architecture patterns
- ✅ API response times < 200ms for standard CRUD operations

### Dependencies

**External Dependencies:**
- PostgreSQL 16 database (or H2 for testing)
- Spring Boot 3.2.0 framework
- Next.js 14.1.0 framework
- Node.js 20.x runtime
- Java 17 JDK

**Internal Dependencies:**
- Story 1 must complete before Story 2 (provides foundation and customer domain)
- Story 2 must complete before Story 3 (provides invoice and payment domains)
- Story 3 depends on Stories 1 and 2 (adds authentication and integration testing)

---

## Story Map - Epic 1

```
Epic: MVP Invoicing System
├── Story 1: Foundation Setup + Customer Management (5 points)
│   Dependencies: None (foundational work)
│   Deliverable: Working customer management (CRUD) with backend and frontend
│
├── Story 2: Invoice & Payment Management (5 points)
│   Dependencies: Story 1 (customer domain required)
│   Deliverable: Complete invoice lifecycle and payment processing
│
└── Story 3: Authentication + Integration Testing (3 points)
    Dependencies: Stories 1 and 2 (requires all domains)
    Deliverable: Secure application with end-to-end test coverage
```

**Total Story Points:** 13
**Estimated Timeline:** 2-3 weeks (1-2 points per day typical velocity)

---

## Stories - Epic 1

### Story 1.1: Foundation Setup + Customer Management

As a **business user**,
I want **to manage customer records (create, view, update, delete)**,
So that **I can maintain accurate customer information for invoicing**.

**Acceptance Criteria:**

**AC #1:** Given a user is on the customer list page, when they click "Create Customer", then a form is displayed with fields for name and email.

**AC #2:** Given a user submits a valid customer form (name and email provided), when they click "Save", then the customer is created and persisted in the database, and the user is redirected to the customer list with a success message.

**AC #3:** Given a customer exists in the system, when a user views the customer list, then all customers are displayed in a table with name and email columns.

**AC #4:** Given a customer exists in the system, when a user clicks on a customer in the list, then the customer detail page is displayed with all customer information.

**AC #5:** Given a user is viewing a customer detail page, when they click "Edit", then the customer form is displayed pre-filled with existing data.

**AC #6:** Given a user submits an updated customer form, when they click "Save", then the customer information is updated in the database, and changes are reflected when the customer is retrieved.

**AC #7:** Given a customer exists in the system, when a user clicks "Delete" and confirms, then the customer is removed from the database, and the user is redirected to the customer list.

**AC #8:** Given invalid customer data (empty name or invalid email), when a user submits the form, then validation errors are displayed, and the customer is not created/updated.

**AC #9:** All backend unit tests for Customer domain entity pass with 80%+ coverage.

**AC #10:** All integration tests for Customer API endpoints (POST, GET, PUT, DELETE) pass.

**AC #11:** E2E test for customer management flow (create → view → edit → delete) passes.

**Prerequisites:** None (foundational work - first vertical slice)

**Technical Notes:**
- Implement Customer domain entity with DDD patterns
- Create CustomerController with REST endpoints
- Implement CQRS: CreateCustomerCommand, UpdateCustomerCommand, DeleteCustomerCommand, GetCustomerQuery, ListCustomersQuery
- Create Next.js pages: customer list, customer detail/edit, create customer
- Implement useCustomers hook (MVVM pattern) and customer API client
- Set up database schema for customers table
- See tech-spec.md for complete implementation details

**Estimated Effort:** 5 points (3-5 days)

---

### Story 1.2: Invoice & Payment Management

As a **business user**,
I want **to create invoices with line items, manage invoice lifecycle, and record payments**,
So that **I can track customer invoices and payments accurately**.

**Acceptance Criteria:**

**AC #1:** Given a customer exists in the system, when a user creates an invoice, then the invoice is created in Draft state and associated with the customer.

**AC #2:** Given an invoice exists in Draft state, when a user adds a line item (description, quantity, unit price), then the line item is added to the invoice, and the invoice balance is recalculated correctly (sum of quantity × unit price).

**AC #3:** Given an invoice exists in Draft state with line items, when a user updates invoice details, then the changes are persisted, and the updated invoice can be retrieved.

**AC #4:** Given an invoice exists in Draft state, when a user marks the invoice as Sent, then the invoice state transitions from Draft to Sent, and the invoice can no longer be modified.

**AC #5:** Given an invoice exists in Sent state, when a user attempts to update the invoice, then the update is rejected with an appropriate error message.

**AC #6:** Given an invoice exists in Sent state, when a user records a payment for the full invoice amount, then the payment is recorded, the invoice balance is reduced to zero, and the invoice state transitions from Sent to Paid.

**AC #7:** Given an invoice exists in Paid state, when a user views the invoice, then the invoice status is displayed as "Paid" with a balance of zero.

**AC #8:** Given an invoice exists, when a user views the invoice detail page, then all line items are displayed with description, quantity, unit price, and subtotal, and the total balance is shown.

**AC #9:** Given invoices exist in the system, when a user views the invoice list, then invoices can be filtered by status (Draft, Sent, Paid) and by customer.

**AC #10:** Given a payment exists for an invoice, when a user views the invoice detail page, then all payments for that invoice are listed with payment amount and date.

**AC #11:** All backend unit tests for Invoice and Payment domain entities pass with 80%+ coverage, including state transition logic.

**AC #12:** All integration tests for Invoice and Payment API endpoints pass.

**AC #13:** E2E test for invoice creation flow (create invoice → add line items → send invoice) passes.

**AC #14:** E2E test for payment recording flow (select invoice → record payment → verify balance update) passes.

**Prerequisites:** Story 1.1 must be complete (customer domain required for invoice creation)

**Technical Notes:**
- Implement Invoice domain entity with lifecycle management (Draft → Sent → Paid)
- Implement Payment domain entity with business rules
- Create InvoiceController and PaymentController with REST endpoints
- Implement CQRS commands and queries for invoices and payments
- Create Next.js pages: invoice list, invoice detail, create invoice, payment recording
- Implement useInvoices and usePayments hooks (MVVM pattern)
- Set up database schema for invoices, invoice_line_items, and payments tables
- See tech-spec.md for complete implementation details

**Estimated Effort:** 5 points (3-5 days)

---

### Story 1.3: Authentication + Integration Testing

As a **system administrator**,
I want **secure authentication and comprehensive integration testing**,
So that **the application is secure and all business flows are verified end-to-end**.

**Acceptance Criteria:**

**AC #1:** Given a user visits the application, when they are not authenticated, then they are redirected to the login page.

**AC #2:** Given a user is on the login page, when they enter valid credentials and click "Login", then they are authenticated, a session is created, and they are redirected to the dashboard.

**AC #3:** Given a user is authenticated, when they access any API endpoint, then the request includes authentication credentials, and the endpoint responds with data.

**AC #4:** Given a user is not authenticated, when they attempt to access any API endpoint, then the request is rejected with a 401 Unauthorized status.

**AC #5:** Given an authenticated user, when they click "Logout", then their session is terminated, and they are redirected to the login page.

**AC #6:** Given invalid login credentials, when a user attempts to log in, then an error message is displayed, and authentication fails.

**AC #7:** Integration test exists for complete Customer → Invoice → Payment flow:
   - Create customer
   - Create invoice with line items
   - Mark invoice as Sent
   - Record payment
   - Verify invoice transitions to Paid state
   - Verify balance calculations are correct throughout

**AC #8:** Integration test verifies invoice state transitions are enforced correctly (Draft → Sent → Paid, invalid transitions rejected).

**AC #9:** Integration test verifies balance calculations are accurate when line items are added and payments are applied.

**AC #10:** All integration tests pass, including the complete business flow test.

**AC #11:** E2E test for complete user journey (login → create customer → create invoice → record payment) passes.

**Prerequisites:** Stories 1.1 and 1.2 must be complete (requires all domains for integration testing)

**Technical Notes:**
- Implement Spring Security configuration for authentication
- Create login endpoint in backend
- Create login page in frontend
- Implement authentication flow (store token, include in API requests)
- Protect all API endpoints with Spring Security
- Write comprehensive integration test for complete business flow
- Write E2E test for full user journey
- See tech-spec.md for complete implementation details

**Estimated Effort:** 3 points (2-3 days)

---

## Implementation Timeline - Epic 1

**Total Story Points:** 13

**Estimated Timeline:** 2-3 weeks (assuming 1-2 points per day typical velocity)

**Implementation Sequence:**

1. **Story 1.1: Foundation Setup + Customer Management** (5 points)
   - Dependencies: None
   - Duration: 3-5 days
   - Deliverable: Working customer management with backend and frontend

2. **Story 1.2: Invoice & Payment Management** (5 points)
   - Dependencies: Story 1.1 (customer domain required)
   - Duration: 3-5 days
   - Deliverable: Complete invoice lifecycle and payment processing

3. **Story 1.3: Authentication + Integration Testing** (3 points)
   - Dependencies: Stories 1.1 and 1.2 (requires all domains)
   - Duration: 2-3 days
   - Deliverable: Secure application with comprehensive test coverage

**Dependency Validation:** ✅ Valid sequence - no forward dependencies

---

## Tech-Spec Reference

See [tech-spec.md](./tech-spec.md) for complete technical implementation details, including:
- Architecture patterns (DDD, CQRS, VSA, Clean Architecture)
- Technology stack with exact versions
- Source tree changes with specific file paths
- Implementation guide with step-by-step instructions
- Testing strategy and acceptance criteria
- Developer resources and code references

