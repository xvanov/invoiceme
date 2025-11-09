# InvoiceMe - Product Requirements Document

**Author:** BMad
**Date:** 2025-11-09
**Version:** 1.0

---

## Executive Summary

InvoiceMe is a production-quality ERP-style invoicing system designed to demonstrate mastery of modern software architecture principles (Domain-Driven Design, CQRS, Vertical Slice Architecture) alongside intelligent and efficient use of AI-assisted development tools.

This assessment project mirrors real-world Software-as-a-Service (SaaS) ERP development, concentrating on core business domains: Customers, Invoices, and Payments. Success requires architectural clarity, separation of concerns, and code quality that aligns with enterprise-level, scalable systems.

### What Makes This Special

The unique value of InvoiceMe lies in demonstrating that while AI tools accelerate code generation, they do not inherently guarantee sound system design. The product showcases the ability to provide architectural guidance necessary to build a correct, maintainable, and scalable application structure, using AI as an accelerator rather than a primary designer.

The system demonstrates enterprise-grade architecture patterns applied to a practical business domain, proving that architectural excellence and AI-assisted development can work together to produce production-quality software.

---

## Project Classification

**Technical Type:** Full-Stack Web Application (API + UI)
**Domain:** Business/Finance (Invoicing & Payments)
**Complexity:** Intermediate

This is a full-stack assessment project requiring both backend API and frontend UI development. The domain involves core business operations (customer management, invoicing, payment processing) with clear business rules and state management requirements.

### Domain Context

The invoicing domain requires careful handling of:
- **Customer Management**: Core entity representing business relationships
- **Invoice Lifecycle**: State transitions from Draft → Sent → Paid
- **Payment Processing**: Applying payments to invoices with balance calculations
- **Line Items**: Multiple items per invoice with quantity and pricing
- **Balance Tracking**: Accurate calculation of invoice balances and payment applications

Business rules are critical:
- Invoices must support multiple line items
- Invoice state transitions must be enforced
- Payment applications must correctly reduce invoice balances
- Balance calculations must be robust and accurate

---

## Success Criteria

### Technical Success Criteria

1. **Architecture Quality**: System demonstrates clear implementation of:
   - Domain-Driven Design (DDD) with rich domain objects
   - Command Query Responsibility Segregation (CQRS)
   - Vertical Slice Architecture (VSA)
   - Clean Architecture layer separation

2. **Performance**: 
   - API response times for standard CRUD operations under 200ms in local testing environment
   - Smooth and responsive UI interactions without noticeable lag

3. **Code Quality**:
   - Modular, readable, and well-documented code
   - Consistent naming conventions and clean code organization
   - Proper use of DTOs and mappers for boundary crossing
   - Integration tests verify end-to-end functionality

4. **AI Tool Utilization**: Effective and intelligent use of AI tools (Cursor, Copilot, v0.dev, Locofy) to accelerate development while maintaining architectural quality

### Business Success Criteria

1. **Functional Completeness**: All core operations (Customer, Invoice, Payment) fully implemented and working
2. **Correctness**: Invoice lifecycle and payment processing work correctly with accurate balance calculations
3. **Demonstrability**: Core functional flow (Customer creation, Invoice creation with line items, Payment application) can be demonstrated
4. **Documentation**: Technical writeup documents architecture, design decisions, and database schema

---

## Product Scope

### MVP - Minimum Viable Product

The MVP must deliver a complete, working invoicing system with:

1. **Customer Management**
   - Create, update, and delete customers
   - Retrieve customer by ID
   - List all customers

2. **Invoice Management**
   - Create invoices in Draft state
   - Update invoice details
   - Mark invoices as Sent
   - Support multiple line items per invoice (services/products, quantity, unit price)
   - Retrieve invoice by ID
   - List invoices by status or customer

3. **Payment Processing**
   - Record payments that apply to invoices
   - Correctly calculate and update invoice balances
   - Retrieve payment by ID
   - List payments for an invoice

4. **Invoice Lifecycle**
   - Enforce state transitions: Draft → Sent → Paid
   - Maintain accurate balance calculations throughout lifecycle

5. **User Authentication**
   - Basic authentication functionality (login screen)
   - Secure access to application data

6. **Integration Testing**
   - End-to-end integration tests for complete Customer → Invoice → Payment flow

### Growth Features (Post-MVP)

Features that enhance the system but are not required for MVP:

1. **Advanced Invoice Features**
   - Invoice templates
   - Recurring invoices
   - Invoice numbering schemes
   - Invoice attachments

2. **Payment Enhancements**
   - Partial payments
   - Payment methods (credit card, bank transfer, etc.)
   - Payment reminders
   - Payment history reports

3. **Reporting & Analytics**
   - Revenue reports
   - Outstanding invoices report
   - Customer payment history
   - Financial dashboards

4. **Customer Enhancements**
   - Customer groups/categories
   - Customer notes and history
   - Customer credit limits

### Vision (Future)

Long-term vision features:

1. **Multi-tenant Support**: Support for multiple organizations/tenants
2. **Advanced Workflows**: Customizable invoice approval workflows
3. **Integration Capabilities**: Integration with accounting systems, payment gateways, CRM systems
4. **Mobile Application**: Native mobile apps for iOS and Android
5. **Advanced Analytics**: Business intelligence and predictive analytics
6. **Automation**: Automated invoice generation, payment reminders, and reconciliation

---

## API/Backend Specific Requirements

### API Specification

The system must expose RESTful APIs for all core operations:

**Customer Endpoints:**
- `POST /api/customers` - Create customer
- `GET /api/customers/{id}` - Retrieve customer by ID
- `GET /api/customers` - List all customers
- `PUT /api/customers/{id}` - Update customer
- `DELETE /api/customers/{id}` - Delete customer

**Invoice Endpoints:**
- `POST /api/invoices` - Create invoice (Draft state)
- `GET /api/invoices/{id}` - Retrieve invoice by ID
- `GET /api/invoices` - List invoices (with optional filters: status, customer)
- `PUT /api/invoices/{id}` - Update invoice
- `POST /api/invoices/{id}/send` - Mark invoice as Sent
- `POST /api/invoices/{id}/items` - Add line item to invoice

**Payment Endpoints:**
- `POST /api/payments` - Record payment (applies to invoice)
- `GET /api/payments/{id}` - Retrieve payment by ID
- `GET /api/payments/invoice/{invoiceId}` - List payments for an invoice

### Authentication & Authorization

- Basic authentication functionality required
- Simple login screen for user authentication
- Secure access to all application data
- Authentication must be implemented for all API endpoints

---

## User Experience Principles

### UX Principles

The UI should provide a clean, professional interface suitable for business use:

1. **Clarity**: Information should be clearly organized and easy to understand
2. **Efficiency**: Common tasks (create invoice, record payment) should be quick and straightforward
3. **Feedback**: Users should receive clear feedback on actions (success, errors, validation)
4. **Consistency**: UI patterns should be consistent throughout the application

### Key Interactions

1. **Customer Management Flow**
   - Create customer → View customer list → Edit customer → Delete customer
   - Customer list should be searchable and filterable

2. **Invoice Creation Flow**
   - Create invoice → Add line items → Review invoice → Mark as sent
   - Invoice should show running total as line items are added
   - Clear indication of invoice state (Draft, Sent, Paid)

3. **Payment Recording Flow**
   - Select invoice → Record payment → View updated balance
   - Payment should clearly show which invoice it applies to
   - Invoice balance should update immediately after payment

4. **Invoice Status Flow**
   - View invoice list → Filter by status → View invoice details → Track payment status
   - Clear visual indicators for invoice states

---

## Functional Requirements

### FR-001: Customer Management - Create Customer
**Priority:** MVP
**Description:** The system must allow users to create new customer records.

**Acceptance Criteria:**
- User can create a customer with required fields
- Customer is persisted in the system
- Created customer can be retrieved by ID
- Validation errors are displayed for invalid input

### FR-002: Customer Management - Update Customer
**Priority:** MVP
**Description:** The system must allow users to update existing customer information.

**Acceptance Criteria:**
- User can update customer details
- Changes are persisted in the system
- Updated customer information is reflected when retrieved

### FR-003: Customer Management - Delete Customer
**Priority:** MVP
**Description:** The system must allow users to delete customer records.

**Acceptance Criteria:**
- User can delete a customer
- Deleted customer is removed from the system
- Appropriate handling of customers with associated invoices (business rule to be defined)

### FR-004: Customer Management - Retrieve Customer by ID
**Priority:** MVP
**Description:** The system must allow users to retrieve a specific customer by their unique identifier.

**Acceptance Criteria:**
- User can retrieve customer details by ID
- System returns customer information if exists
- System returns appropriate error if customer not found

### FR-005: Customer Management - List All Customers
**Priority:** MVP
**Description:** The system must allow users to retrieve a list of all customers.

**Acceptance Criteria:**
- User can retrieve list of all customers
- List includes all customer records
- List can be paginated if needed (implementation detail)

### FR-006: Invoice Management - Create Invoice (Draft)
**Priority:** MVP
**Description:** The system must allow users to create new invoices in Draft state.

**Acceptance Criteria:**
- User can create a new invoice
- Invoice is created in Draft state
- Invoice is associated with a customer
- Invoice can be retrieved by ID after creation

### FR-007: Invoice Management - Update Invoice
**Priority:** MVP
**Description:** The system must allow users to update invoice details while in Draft state.

**Acceptance Criteria:**
- User can update invoice details
- Updates are only allowed for Draft invoices (business rule)
- Changes are persisted in the system
- Updated invoice information is reflected when retrieved

### FR-008: Invoice Management - Add Line Items
**Priority:** MVP
**Description:** The system must allow users to add multiple line items to an invoice, each describing a service/product with quantity and unit price.

**Acceptance Criteria:**
- User can add line items to an invoice
- Each line item includes: description, quantity, unit price
- Invoice balance is calculated correctly as line items are added
- Line items can be added to Draft invoices
- Multiple line items can be associated with a single invoice

### FR-009: Invoice Management - Mark Invoice as Sent
**Priority:** MVP
**Description:** The system must allow users to transition an invoice from Draft to Sent state.

**Acceptance Criteria:**
- User can mark a Draft invoice as Sent
- Invoice state transitions from Draft to Sent
- Sent invoices cannot be modified (business rule)
- State transition is persisted

### FR-010: Invoice Management - Retrieve Invoice by ID
**Priority:** MVP
**Description:** The system must allow users to retrieve a specific invoice by its unique identifier.

**Acceptance Criteria:**
- User can retrieve invoice details by ID
- Invoice details include all line items and current balance
- System returns invoice information if exists
- System returns appropriate error if invoice not found

### FR-011: Invoice Management - List Invoices
**Priority:** MVP
**Description:** The system must allow users to retrieve a list of invoices, optionally filtered by status or customer.

**Acceptance Criteria:**
- User can retrieve list of all invoices
- User can filter invoices by status (Draft, Sent, Paid)
- User can filter invoices by customer
- List includes all matching invoice records

### FR-012: Invoice Lifecycle - State Transitions
**Priority:** MVP
**Description:** The system must enforce the invoice lifecycle state transitions: Draft → Sent → Paid.

**Acceptance Criteria:**
- Invoices can only transition from Draft to Sent
- Invoices transition from Sent to Paid when fully paid
- Invalid state transitions are prevented
- Current state is always visible and accurate

### FR-013: Invoice Balance - Calculate Running Balance
**Priority:** MVP
**Description:** The system must correctly calculate the running invoice balance based on line items.

**Acceptance Criteria:**
- Invoice balance is calculated as sum of (quantity × unit price) for all line items
- Balance is updated when line items are added or modified
- Balance is displayed accurately on invoice
- Balance calculation is robust and handles edge cases

### FR-014: Payment Processing - Record Payment
**Priority:** MVP
**Description:** The system must allow users to record payments that apply to invoices.

**Acceptance Criteria:**
- User can record a payment
- Payment is associated with a specific invoice
- Payment amount is applied to invoice balance
- Payment is persisted in the system
- Payment can be retrieved by ID after creation

### FR-015: Payment Processing - Apply Payment to Invoice Balance
**Priority:** MVP
**Description:** The system must correctly apply payments to invoice balances and update invoice state when fully paid.

**Acceptance Criteria:**
- Payment amount reduces invoice balance correctly
- Invoice balance is updated immediately after payment
- Invoice transitions to Paid state when balance reaches zero
- Multiple payments can be applied to a single invoice
- Payment application logic is robust and accurate

### FR-016: Payment Processing - Retrieve Payment by ID
**Priority:** MVP
**Description:** The system must allow users to retrieve a specific payment by its unique identifier.

**Acceptance Criteria:**
- User can retrieve payment details by ID
- Payment details include associated invoice information
- System returns payment information if exists
- System returns appropriate error if payment not found

### FR-017: Payment Processing - List Payments for Invoice
**Priority:** MVP
**Description:** The system must allow users to retrieve all payments associated with a specific invoice.

**Acceptance Criteria:**
- User can retrieve list of all payments for an invoice
- List includes all payment records for the specified invoice
- Payments are listed in chronological order (implementation detail)

### FR-018: User Authentication - Login
**Priority:** MVP
**Description:** The system must provide basic authentication functionality to secure access to application data.

**Acceptance Criteria:**
- User can log in with credentials
- Login screen is provided
- Authenticated users can access application features
- Unauthenticated users are denied access
- Authentication is enforced for all API endpoints

### FR-019: Integration Testing - End-to-End Flow
**Priority:** MVP
**Description:** The system must include integration tests that verify the complete Customer → Invoice → Payment flow.

**Acceptance Criteria:**
- Integration tests exist for complete flow
- Tests verify: Customer creation → Invoice creation with line items → Payment application
- Tests verify correct balance calculations throughout flow
- Tests verify state transitions work correctly
- All integration tests pass

---

## Non-Functional Requirements

### Performance

1. **API Latency**: API response times for standard CRUD operations MUST be under 200ms in a local testing environment
2. **UI Responsiveness**: Smooth and responsive UI interactions without noticeable lag
3. **Balance Calculation**: Invoice balance calculations must complete in real-time without performance degradation

### Security

1. **Authentication**: Basic authentication functionality required for all API endpoints
2. **Data Protection**: Application data must be secured and accessible only to authenticated users
3. **Input Validation**: All user inputs must be validated to prevent security vulnerabilities

### Scalability

1. **Database Design**: Database schema must support growth in customers, invoices, and payments
2. **Architecture**: System architecture must be designed to handle increased load (though not required to demonstrate in MVP)

### Code Quality

1. **Modularity**: Code must be modular, readable, and well-documented
2. **Data Transfer**: Use explicit DTOs (Data Transfer Objects) and mappers for boundary crossing (API to Application Layer)
3. **Consistency**: Consistent naming conventions and clean code organization required throughout the repository
4. **Documentation**: Code must be well-documented with clear comments and structure

### Testing

1. **Integration Tests**: MUST implement integration tests to verify end-to-end functionality across key modules (e.g., the complete Customer Payment flow)
2. **Test Coverage**: Integration tests must cover critical business flows
3. **Test Results**: Evidence of passing integration tests must be provided

### AI Tool Utilization

1. **Documentation**: Detailed documentation of specific AI tools used, including example prompts
2. **Justification**: Justification for how AI tools accelerated development while maintaining architectural quality
3. **Effectiveness**: Evaluation will measure how effectively and intelligently AI tools were utilized

---

## Implementation Planning

### Epic Breakdown Required

Requirements must be decomposed into epics and bite-sized stories (200k context limit).

**Next Step:** Run `workflow create-epics-and-stories` to create the implementation breakdown.

### Technical Preferences & Constraints

**Note:** The following technical details are provided as preferences/constraints for the architecture phase. These should be documented in the Technical Specification, not implemented as part of functional requirements.

**Architectural Principles (Mandatory):**
- Domain-Driven Design (DDD): Model core entities (Customer, Invoice, Payment) as true Domain Objects with rich behavior
- Command Query Responsibility Segregation (CQRS): Implement clean separation between write operations (Commands) and read operations (Queries)
- Vertical Slice Architecture (VSA): Organize code around features or use cases (vertical slices) rather than technical layers (horizontal slicing)
- Layer Separation: Maintain clear boundaries between Domain, Application, and Infrastructure layers (Clean Architecture)

**Technical Stack Preferences:**
- Back-End (API): Java with Spring Boot, must expose RESTful APIs
- Front-End (UI): TypeScript with React.js or Next.js, must adhere to MVVM (Model-View-ViewModel) principles for UI logic
- Database: PostgreSQL preferred for production readiness simulation; in-memory database (H2 or SQLite) permitted for testing and rapid development
- Cloud Platforms: Deployment target flexibility: AWS or Azure

**Advanced Patterns (Optional):**
- Domain Events: Use of optional Domain Events is encouraged to demonstrate advanced DDD modeling

---

## References

_No source documents referenced. This is an assessment project with requirements defined in this PRD._

---

## Next Steps

1. **Epic & Story Breakdown** - Run: `workflow create-epics-and-stories`
2. **UX Design** (if UI) - Run: `workflow create-ux-design`
3. **Architecture** - Run: `workflow create-architecture`

---

_This PRD captures the essence of InvoiceMe - demonstrating enterprise-grade architecture patterns applied to a practical business domain, proving that architectural excellence and AI-assisted development can work together to produce production-quality software._

_Created through collaborative discovery between BMad and AI facilitator._
