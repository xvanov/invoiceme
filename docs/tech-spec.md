# InvoiceMe - Technical Specification

**Author:** BMad
**Date:** 2025-11-09
**Project Level:** 1
**Change Type:** Feature Implementation
**Development Context:** Greenfield MVP Development

---

## Context

### Available Documents

**PRD.md** - Product Requirements Document containing complete MVP requirements:
- MVP scope: Customer Management, Invoice Management, Payment Processing, Invoice Lifecycle, User Authentication, Integration Testing
- 19 functional requirements (FR-001 through FR-019) with detailed acceptance criteria
- API endpoint specifications for all core operations
- Non-functional requirements: Performance, Security, Scalability, Code Quality, Testing
- Technical preferences: Java/Spring Boot backend, TypeScript/React or Next.js frontend, PostgreSQL database
- Architectural principles: DDD, CQRS, Vertical Slice Architecture, Clean Architecture

**Key Insights:**
- Full-stack application requiring both API and UI development
- Domain-driven design with rich domain objects (Customer, Invoice, Payment)
- CQRS pattern for command/query separation
- Vertical slice organization around features/use cases
- Enterprise-grade architecture patterns for production-quality system

### Project Stack

**Backend Stack:**
- **Runtime:** Java 17 (LTS)
- **Framework:** Spring Boot 3.2.0
- **Build Tool:** Maven 3.9.x or Gradle 8.5
- **Persistence:** Spring Data JPA 3.2.0 with Hibernate 6.4.0
- **Database:** PostgreSQL 16 (production), H2 2.2.224 (testing)
- **Security:** Spring Security 6.2.0
- **Testing:** JUnit 5.10.0, Mockito 5.7.0, Spring Boot Test
- **API Documentation:** SpringDoc OpenAPI 2.3.0

**Frontend Stack:**
- **Framework:** Next.js 14.1.0 (App Router)
- **Language:** TypeScript 5.3.3
- **UI Library:** React 18.2.0
- **State Management:** React Context API + Custom Hooks (MVVM pattern)
- **HTTP Client:** Axios 1.6.5 or Fetch API
- **Form Handling:** React Hook Form 7.49.3
- **Validation:** Zod 3.22.4
- **Styling:** Tailwind CSS 3.4.1 (recommended) or CSS Modules
- **Testing:** Jest 29.7.0, React Testing Library 14.1.2, Playwright 1.41.0 (E2E)

**Development Tools:**
- **Version Control:** Git
- **Package Management:** npm 10.2.4 or yarn 1.22.19
- **Linting:** ESLint 8.56.0, Prettier 3.2.4
- **Type Checking:** TypeScript compiler
- **CI/CD:** GitHub Actions (recommended) or GitLab CI

### Existing Codebase Structure

**Greenfield Project** - New codebase to be established with the following structure:

**Backend Structure (Spring Boot):**
```
src/
  main/
    java/
      com/invoiceme/
        domain/              # Domain layer (DDD)
          customer/
          invoice/
          payment/
        application/          # Application layer (CQRS)
          commands/           # Write operations
          queries/            # Read operations
        infrastructure/       # Infrastructure layer
          persistence/
          web/
          security/
        api/                  # API layer (Vertical Slices)
          customers/
          invoices/
          payments/
    resources/
      application.yml
      application-dev.yml
      application-test.yml
  test/
    java/
      com/invoiceme/
        # Test structure mirrors main structure
```

**Frontend Structure (Next.js):**
```
src/
  app/                       # Next.js App Router
    (auth)/
      login/
    (dashboard)/
      customers/
      invoices/
      payments/
    api/                     # API routes (if needed)
  components/                # Reusable UI components
    ui/                      # Base UI components
    forms/                   # Form components
    layout/                  # Layout components
  lib/                       # Utilities and helpers
    api/                     # API client
    hooks/                   # Custom React hooks (MVVM)
    utils/                   # Utility functions
    validation/              # Zod schemas
  types/                     # TypeScript type definitions
  styles/                   # Global styles
public/                      # Static assets
```

**Testing Structure:**
```
tests/
  unit/                      # Unit tests
  integration/               # Integration tests
  e2e/                       # End-to-end tests
  fixtures/                  # Test data
  support/                   # Test utilities
```

---

## The Change

### Problem Statement

InvoiceMe requires a complete MVP implementation of an ERP-style invoicing system that demonstrates mastery of modern software architecture principles (DDD, CQRS, VSA, Clean Architecture) while delivering a production-quality, working invoicing application.

The system must provide:
- Complete customer management (CRUD operations)
- Invoice lifecycle management with state transitions (Draft → Sent → Paid)
- Payment processing with accurate balance calculations
- User authentication for secure access
- Integration testing to verify end-to-end functionality

### Proposed Solution

Implement a full-stack invoicing application following Domain-Driven Design principles with:
- **Rich Domain Models:** Customer, Invoice, Payment as true domain objects with business logic
- **CQRS Pattern:** Separate command (write) and query (read) operations
- **Vertical Slice Architecture:** Organize code around features (customers, invoices, payments) rather than technical layers
- **Clean Architecture:** Clear separation between Domain, Application, and Infrastructure layers
- **RESTful API:** Spring Boot backend exposing REST endpoints for all operations
- **Modern UI:** Next.js frontend with TypeScript, following MVVM pattern for UI logic
- **PostgreSQL Database:** Production-ready database with H2 for testing

### Scope

**In Scope:**

1. **Customer Management Domain**
   - Create, read, update, delete customer operations
   - Customer entity with business validation rules
   - REST API endpoints for customer operations
   - UI screens for customer management

2. **Invoice Management Domain**
   - Create invoices in Draft state
   - Update invoice details (only in Draft state)
   - Add multiple line items to invoices
   - Mark invoices as Sent (state transition)
   - Retrieve invoices by ID or list with filters
   - Invoice entity with lifecycle management
   - REST API endpoints for invoice operations
   - UI screens for invoice creation and management

3. **Payment Processing Domain**
   - Record payments that apply to invoices
   - Calculate and update invoice balances
   - Transition invoices to Paid state when fully paid
   - Retrieve payments by ID or list by invoice
   - Payment entity with business rules
   - REST API endpoints for payment operations
   - UI screens for payment recording

4. **Invoice Lifecycle Management**
   - Enforce state transitions: Draft → Sent → Paid
   - Prevent invalid state transitions
   - Maintain accurate balance calculations throughout lifecycle
   - Business rules for state changes

5. **User Authentication**
   - Basic authentication functionality
   - Login screen
   - Secure access to all API endpoints
   - Session management

6. **Integration Testing**
   - End-to-end tests for complete Customer → Invoice → Payment flow
   - Verify state transitions work correctly
   - Verify balance calculations are accurate

**Out of Scope:**

1. **Advanced Invoice Features** (Post-MVP)
   - Invoice templates
   - Recurring invoices
   - Invoice numbering schemes
   - Invoice attachments

2. **Payment Enhancements** (Post-MVP)
   - Partial payments (MVP supports full payments only)
   - Payment methods (credit card, bank transfer, etc.)
   - Payment reminders
   - Payment history reports

3. **Reporting & Analytics** (Post-MVP)
   - Revenue reports
   - Outstanding invoices report
   - Customer payment history
   - Financial dashboards

4. **Customer Enhancements** (Post-MVP)
   - Customer groups/categories
   - Customer notes and history
   - Customer credit limits

5. **Multi-tenant Support** (Future)
6. **Advanced Workflows** (Future)
7. **Third-party Integrations** (Future)
8. **Mobile Applications** (Future)

---

## Implementation Details

### Source Tree Changes

**Backend - Domain Layer:**
- `src/main/java/com/invoiceme/domain/customer/Customer.java` - CREATE - Customer domain entity with rich behavior
- `src/main/java/com/invoiceme/domain/customer/CustomerId.java` - CREATE - Value object for customer ID
- `src/main/java/com/invoiceme/domain/invoice/Invoice.java` - CREATE - Invoice domain entity with lifecycle management
- `src/main/java/com/invoiceme/domain/invoice/InvoiceId.java` - CREATE - Value object for invoice ID
- `src/main/java/com/invoiceme/domain/invoice/InvoiceStatus.java` - CREATE - Enum for invoice states (Draft, Sent, Paid)
- `src/main/java/com/invoiceme/domain/invoice/InvoiceLineItem.java` - CREATE - Value object for invoice line items
- `src/main/java/com/invoiceme/domain/payment/Payment.java` - CREATE - Payment domain entity
- `src/main/java/com/invoiceme/domain/payment/PaymentId.java` - CREATE - Value object for payment ID

**Backend - Application Layer (CQRS):**
- `src/main/java/com/invoiceme/application/commands/customer/CreateCustomerCommand.java` - CREATE - Command for creating customers
- `src/main/java/com/invoiceme/application/commands/customer/UpdateCustomerCommand.java` - CREATE - Command for updating customers
- `src/main/java/com/invoiceme/application/commands/customer/DeleteCustomerCommand.java` - CREATE - Command for deleting customers
- `src/main/java/com/invoiceme/application/queries/customer/GetCustomerQuery.java` - CREATE - Query for retrieving customer
- `src/main/java/com/invoiceme/application/queries/customer/ListCustomersQuery.java` - CREATE - Query for listing customers
- `src/main/java/com/invoiceme/application/commands/invoice/CreateInvoiceCommand.java` - CREATE - Command for creating invoices
- `src/main/java/com/invoiceme/application/commands/invoice/UpdateInvoiceCommand.java` - CREATE - Command for updating invoices
- `src/main/java/com/invoiceme/application/commands/invoice/AddLineItemCommand.java` - CREATE - Command for adding line items
- `src/main/java/com/invoiceme/application/commands/invoice/SendInvoiceCommand.java` - CREATE - Command for sending invoices
- `src/main/java/com/invoiceme/application/queries/invoice/GetInvoiceQuery.java` - CREATE - Query for retrieving invoice
- `src/main/java/com/invoiceme/application/queries/invoice/ListInvoicesQuery.java` - CREATE - Query for listing invoices
- `src/main/java/com/invoiceme/application/commands/payment/RecordPaymentCommand.java` - CREATE - Command for recording payments
- `src/main/java/com/invoiceme/application/queries/payment/GetPaymentQuery.java` - CREATE - Query for retrieving payment
- `src/main/java/com/invoiceme/application/queries/payment/ListPaymentsQuery.java` - CREATE - Query for listing payments

**Backend - API Layer (Vertical Slices):**
- `src/main/java/com/invoiceme/api/customers/CustomerController.java` - CREATE - REST controller for customer endpoints
- `src/main/java/com/invoiceme/api/customers/CustomerDto.java` - CREATE - DTO for customer data transfer
- `src/main/java/com/invoiceme/api/invoices/InvoiceController.java` - CREATE - REST controller for invoice endpoints
- `src/main/java/com/invoiceme/api/invoices/InvoiceDto.java` - CREATE - DTO for invoice data transfer
- `src/main/java/com/invoiceme/api/invoices/InvoiceLineItemDto.java` - CREATE - DTO for line items
- `src/main/java/com/invoiceme/api/payments/PaymentController.java` - CREATE - REST controller for payment endpoints
- `src/main/java/com/invoiceme/api/payments/PaymentDto.java` - CREATE - DTO for payment data transfer

**Backend - Infrastructure Layer:**
- `src/main/java/com/invoiceme/infrastructure/persistence/customer/CustomerRepository.java` - CREATE - JPA repository interface
- `src/main/java/com/invoiceme/infrastructure/persistence/invoice/InvoiceRepository.java` - CREATE - JPA repository interface
- `src/main/java/com/invoiceme/infrastructure/persistence/payment/PaymentRepository.java` - CREATE - JPA repository interface
- `src/main/java/com/invoiceme/infrastructure/security/SecurityConfig.java` - CREATE - Spring Security configuration
- `src/main/java/com/invoiceme/infrastructure/security/JwtAuthenticationFilter.java` - CREATE - JWT authentication filter (if using JWT)

**Backend - Configuration:**
- `src/main/resources/application.yml` - CREATE - Main application configuration
- `src/main/resources/application-dev.yml` - CREATE - Development profile configuration
- `src/main/resources/application-test.yml` - CREATE - Test profile configuration (H2 database)
- `pom.xml` or `build.gradle` - CREATE - Build configuration with all dependencies

**Backend - Database:**
- `src/main/resources/db/migration/V1__Initial_schema.sql` - CREATE - Flyway migration for initial schema (if using Flyway)
- Database schema: customers, invoices, invoice_line_items, payments tables

**Frontend - Pages (Next.js App Router):**
- `src/app/(auth)/login/page.tsx` - CREATE - Login page
- `src/app/(dashboard)/customers/page.tsx` - CREATE - Customer list page
- `src/app/(dashboard)/customers/[id]/page.tsx` - CREATE - Customer detail/edit page
- `src/app/(dashboard)/customers/new/page.tsx` - CREATE - Create customer page
- `src/app/(dashboard)/invoices/page.tsx` - CREATE - Invoice list page
- `src/app/(dashboard)/invoices/[id]/page.tsx` - CREATE - Invoice detail page
- `src/app/(dashboard)/invoices/new/page.tsx` - CREATE - Create invoice page
- `src/app/(dashboard)/payments/page.tsx` - CREATE - Payment list page
- `src/app/(dashboard)/payments/new/page.tsx` - CREATE - Record payment page
- `src/app/layout.tsx` - CREATE - Root layout
- `src/app/page.tsx` - CREATE - Dashboard/home page

**Frontend - Components:**
- `src/components/ui/Button.tsx` - CREATE - Reusable button component
- `src/components/ui/Input.tsx` - CREATE - Reusable input component
- `src/components/ui/Table.tsx` - CREATE - Reusable table component
- `src/components/forms/CustomerForm.tsx` - CREATE - Customer form component
- `src/components/forms/InvoiceForm.tsx` - CREATE - Invoice form component
- `src/components/forms/PaymentForm.tsx` - CREATE - Payment form component
- `src/components/layout/Header.tsx` - CREATE - Header component
- `src/components/layout/Sidebar.tsx` - CREATE - Sidebar navigation component

**Frontend - MVVM Layer:**
- `src/lib/hooks/useCustomers.ts` - CREATE - Custom hook for customer operations (ViewModel)
- `src/lib/hooks/useInvoices.ts` - CREATE - Custom hook for invoice operations (ViewModel)
- `src/lib/hooks/usePayments.ts` - CREATE - Custom hook for payment operations (ViewModel)
- `src/lib/api/customers.ts` - CREATE - API client for customer endpoints (Model)
- `src/lib/api/invoices.ts` - CREATE - API client for invoice endpoints (Model)
- `src/lib/api/payments.ts` - CREATE - API client for payment endpoints (Model)
- `src/lib/api/client.ts` - CREATE - Base API client with authentication

**Frontend - Types:**
- `src/types/customer.ts` - CREATE - TypeScript types for customer
- `src/types/invoice.ts` - CREATE - TypeScript types for invoice
- `src/types/payment.ts` - CREATE - TypeScript types for payment
- `src/types/api.ts` - CREATE - API response types

**Frontend - Validation:**
- `src/lib/validation/customerSchema.ts` - CREATE - Zod schema for customer validation
- `src/lib/validation/invoiceSchema.ts` - CREATE - Zod schema for invoice validation
- `src/lib/validation/paymentSchema.ts` - CREATE - Zod schema for payment validation

**Testing:**
- `src/test/java/com/invoiceme/domain/customer/CustomerTest.java` - CREATE - Unit tests for Customer domain
- `src/test/java/com/invoiceme/domain/invoice/InvoiceTest.java` - CREATE - Unit tests for Invoice domain
- `src/test/java/com/invoiceme/domain/payment/PaymentTest.java` - CREATE - Unit tests for Payment domain
- `src/test/java/com/invoiceme/application/commands/...` - CREATE - Command handler tests
- `src/test/java/com/invoiceme/application/queries/...` - CREATE - Query handler tests
- `src/test/java/com/invoiceme/api/...` - CREATE - Integration tests for API endpoints
- `src/test/java/com/invoiceme/integration/CustomerInvoicePaymentFlowTest.java` - CREATE - End-to-end integration test
- `tests/e2e/customer-flow.spec.ts` - CREATE - E2E test for customer management
- `tests/e2e/invoice-flow.spec.ts` - CREATE - E2E test for invoice creation
- `tests/e2e/payment-flow.spec.ts` - CREATE - E2E test for payment recording
- `tests/e2e/complete-flow.spec.ts` - CREATE - E2E test for complete Customer → Invoice → Payment flow

### Technical Approach

**Architecture Pattern: Domain-Driven Design (DDD)**
- Model Customer, Invoice, and Payment as rich domain objects with business logic
- Use value objects for IDs and other domain concepts
- Encapsulate business rules within domain entities
- Domain layer has no dependencies on infrastructure

**Command Query Responsibility Segregation (CQRS)**
- Separate command handlers (write operations) from query handlers (read operations)
- Commands: CreateCustomerCommand, UpdateCustomerCommand, CreateInvoiceCommand, etc.
- Queries: GetCustomerQuery, ListCustomersQuery, GetInvoiceQuery, etc.
- Allows independent optimization of read and write paths

**Vertical Slice Architecture (VSA)**
- Organize code around features (customers, invoices, payments) rather than technical layers
- Each vertical slice contains: API controller, DTOs, command/query handlers, domain logic
- Reduces coupling between features
- Makes features independently deployable

**Clean Architecture Layer Separation**
- **Domain Layer:** Pure business logic, no framework dependencies
- **Application Layer:** Use cases (commands/queries), orchestration logic
- **Infrastructure Layer:** Persistence (JPA repositories), web (Spring MVC), security
- **API Layer:** REST controllers, DTOs, request/response mapping

**Backend Implementation:**
- Use Spring Boot 3.2.0 with Java 17
- Spring Data JPA for persistence with PostgreSQL 16 (production) and H2 (testing)
- Spring Security for authentication and authorization
- RESTful API design following REST principles
- DTOs for all API boundaries to decouple domain from API
- Mappers to convert between domain objects and DTOs

**Frontend Implementation:**
- Use Next.js 14.1.0 with App Router for modern React development
- TypeScript 5.3.3 for type safety
- MVVM pattern: Custom React hooks as ViewModels, API clients as Models, React components as Views
- React Hook Form for form management with Zod validation
- Tailwind CSS for styling (or CSS Modules)
- Axios or Fetch API for HTTP requests
- React Context API for global state (authentication, user session)

**Database Design:**
- PostgreSQL 16 for production with proper indexing
- H2 in-memory database for testing
- JPA entities map to domain objects
- Use Flyway or Liquibase for database migrations
- Proper foreign key relationships: invoices → customers, payments → invoices

**Authentication:**
- Spring Security for backend authentication
- JWT tokens or session-based authentication
- Secure all API endpoints except login
- Frontend: Store auth token in httpOnly cookie or localStorage (with XSS protection)

### Existing Patterns to Follow

**Greenfield Project** - Establishing new patterns:

**Backend Patterns:**
- Domain entities are immutable where possible, use builder pattern for construction
- Value objects for IDs and domain concepts (CustomerId, InvoiceId, etc.)
- Repository pattern for data access (Spring Data JPA repositories)
- Command/Query handlers use dependency injection
- DTOs use Java records for immutability
- Mappers use MapStruct or manual mapping for DTO ↔ Domain conversion
- Exception handling: Custom domain exceptions (CustomerNotFoundException, etc.)
- Logging: Use SLF4J with Logback

**Frontend Patterns:**
- MVVM: Custom hooks (ViewModels) encapsulate business logic and state
- API clients (Models) handle data fetching and mutations
- React components (Views) are presentational, delegate to ViewModels
- Form validation: Zod schemas with React Hook Form
- Error handling: Try-catch in ViewModels, display errors in UI
- Loading states: Use React state in ViewModels
- Type safety: Strict TypeScript, no `any` types

**Testing Patterns:**
- Unit tests: Test domain logic in isolation
- Integration tests: Test API endpoints with TestRestTemplate or MockMvc
- E2E tests: Playwright for full browser testing
- Test data: Use factories/builders for test entities
- Mock external dependencies in unit tests
- Use test containers or H2 for integration tests

### Integration Points

**Backend Integration Points:**
- **Spring Data JPA ↔ PostgreSQL:** JPA repositories connect to database
- **Spring Security ↔ Authentication:** Security filter chain protects endpoints
- **REST Controllers ↔ Application Layer:** Controllers call command/query handlers
- **DTOs ↔ Domain Objects:** Mappers convert between API and domain layers

**Frontend Integration Points:**
- **API Client ↔ Backend REST API:** HTTP requests to Spring Boot endpoints
- **React Hooks ↔ API Client:** ViewModels call API client methods
- **React Components ↔ Hooks:** Components use custom hooks for data and operations
- **Forms ↔ Validation:** React Hook Form integrates with Zod schemas

**Cross-Cutting Concerns:**
- **Authentication:** Frontend sends auth token in request headers, backend validates via Spring Security
- **Error Handling:** Backend returns standardized error responses, frontend displays user-friendly messages
- **Validation:** Backend validates DTOs, frontend validates forms before submission

### Development Context

**Relevant Existing Code:**
- None (greenfield project)

**Framework/Libraries:**
- **Backend:**
  - Spring Boot 3.2.0 (web framework)
  - Spring Data JPA 3.2.0 (persistence)
  - Spring Security 6.2.0 (authentication)
  - Hibernate 6.4.0 (ORM)
  - PostgreSQL JDBC Driver 42.7.1 (database)
  - H2 Database 2.2.224 (testing)
  - JUnit 5.10.0 (testing)
  - Mockito 5.7.0 (mocking)
  - SpringDoc OpenAPI 2.3.0 (API documentation)

- **Frontend:**
  - Next.js 14.1.0 (React framework)
  - React 18.2.0 (UI library)
  - TypeScript 5.3.3 (language)
  - React Hook Form 7.49.3 (form management)
  - Zod 3.22.4 (validation)
  - Axios 1.6.5 (HTTP client)
  - Tailwind CSS 3.4.1 (styling)
  - Jest 29.7.0 (testing)
  - React Testing Library 14.1.2 (component testing)
  - Playwright 1.41.0 (E2E testing)

**Internal Modules:**
- Domain entities: Customer, Invoice, Payment
- Application services: Command handlers, Query handlers
- API controllers: CustomerController, InvoiceController, PaymentController
- Infrastructure: Repositories, Security configuration

**Configuration Changes:**
- `application.yml`: Database connection, JPA settings, security configuration
- `application-dev.yml`: Development database, logging levels
- `application-test.yml`: H2 database configuration for tests
- `next.config.js`: Next.js configuration (API proxy, environment variables)
- `.env.local`: Frontend environment variables (API base URL, etc.)

### Existing Conventions (Brownfield)

**Greenfield project** - Establishing new conventions per modern best practices:

**Code Style:**
- Java: Follow Google Java Style Guide or Spring Boot conventions
- TypeScript: Use ESLint with recommended rules, Prettier for formatting
- Naming: camelCase for variables/methods, PascalCase for classes/components
- File naming: Match class/component names

**Project Structure:**
- Backend: Package by feature (customers, invoices, payments) within layer structure
- Frontend: Feature-based folder structure within Next.js App Router
- Tests: Mirror source structure in test directories

**Git Workflow:**
- Feature branches for new features
- Conventional commits: `feat:`, `fix:`, `test:`, etc.
- Pull requests for code review

### Test Framework & Standards

**Backend Testing:**
- **Framework:** JUnit 5.10.0
- **Mocking:** Mockito 5.7.0
- **Integration Testing:** Spring Boot Test with @SpringBootTest
- **Test Naming:** `MethodName_StateUnderTest_ExpectedBehavior`
- **Coverage:** Aim for 80%+ coverage on domain and application layers

**Frontend Testing:**
- **Unit Testing:** Jest 29.7.0 with React Testing Library 14.1.2
- **E2E Testing:** Playwright 1.41.0
- **Test Naming:** Descriptive test names explaining what is tested
- **Coverage:** Aim for 70%+ coverage on components and hooks

**Test Organization:**
- Unit tests: Co-located with source files or in `__tests__` directories
- Integration tests: `src/test/java/com/invoiceme/integration/`
- E2E tests: `tests/e2e/`
- Test data: `tests/fixtures/` or `tests/support/factories/`

---

## Implementation Stack

**Backend:**
- Runtime: Java 17 (LTS)
- Framework: Spring Boot 3.2.0
- Build Tool: Maven 3.9.x or Gradle 8.5
- Persistence: Spring Data JPA 3.2.0, Hibernate 6.4.0
- Database: PostgreSQL 16 (production), H2 2.2.224 (testing)
- Security: Spring Security 6.2.0
- Testing: JUnit 5.10.0, Mockito 5.7.0
- API Documentation: SpringDoc OpenAPI 2.3.0

**Frontend:**
- Framework: Next.js 14.1.0 (App Router)
- Language: TypeScript 5.3.3
- UI Library: React 18.2.0
- Form Management: React Hook Form 7.49.3
- Validation: Zod 3.22.4
- HTTP Client: Axios 1.6.5
- Styling: Tailwind CSS 3.4.1
- Testing: Jest 29.7.0, React Testing Library 14.1.2, Playwright 1.41.0

**Development Tools:**
- Version Control: Git
- Package Management: npm 10.2.4 or yarn 1.22.19
- Linting: ESLint 8.56.0, Prettier 3.2.4
- CI/CD: GitHub Actions or GitLab CI

---

## Technical Details

**Domain Model Design:**
- **Customer Entity:** Contains business logic for customer validation, name formatting
- **Invoice Entity:** Manages lifecycle (Draft → Sent → Paid), calculates balance from line items, enforces state transition rules
- **Payment Entity:** Applies to invoice, updates invoice balance, triggers state transition to Paid when balance reaches zero
- **Value Objects:** CustomerId, InvoiceId, PaymentId, InvoiceLineItem (immutable, validated)

**State Management:**
- **Invoice Status:** Enum with three states (Draft, Sent, Paid)
- **State Transitions:** Enforced in domain layer, only valid transitions allowed
- **Balance Calculation:** Calculated from line items (quantity × unit price), updated when payments applied

**Business Rules:**
- Invoices can only be updated in Draft state
- Invoices transition to Sent state via explicit action
- Invoices transition to Paid state automatically when balance reaches zero
- Payments must be associated with an invoice
- Payment amount cannot exceed invoice balance (for MVP, assume full payment only)

**API Design:**
- RESTful endpoints following REST principles
- HTTP methods: POST (create), GET (read), PUT (update), DELETE (delete)
- Status codes: 200 (success), 201 (created), 400 (bad request), 401 (unauthorized), 404 (not found), 500 (server error)
- Request/Response: JSON format
- Error responses: Standardized error format with message and error code

**Database Schema:**
- **customers table:** id (UUID), name, email, address, created_at, updated_at
- **invoices table:** id (UUID), customer_id (FK), status (enum), total_amount (decimal), created_at, updated_at, sent_at
- **invoice_line_items table:** id (UUID), invoice_id (FK), description, quantity (integer), unit_price (decimal)
- **payments table:** id (UUID), invoice_id (FK), amount (decimal), payment_date (timestamp), created_at

**Performance Considerations:**
- Database indexes on foreign keys and frequently queried fields
- JPA lazy loading for relationships
- Pagination for list endpoints
- API response times target: < 200ms for standard CRUD operations

**Security Considerations:**
- All API endpoints require authentication (except login)
- Password hashing using BCrypt
- JWT tokens with expiration or session-based authentication
- Input validation on both frontend and backend
- SQL injection prevention via JPA parameterized queries
- XSS prevention via React's built-in escaping

**Error Handling:**
- Domain exceptions: CustomerNotFoundException, InvoiceNotFoundException, etc.
- Global exception handler in Spring Boot for consistent error responses
- Frontend error boundaries for React error handling
- User-friendly error messages displayed in UI

**Edge Cases:**
- Customer deletion with associated invoices (business rule: prevent deletion or cascade)
- Invoice update after being sent (prevented by business rule)
- Payment exceeding invoice balance (prevented by validation)
- Concurrent payment processing (handle with optimistic locking if needed)

---

## Development Setup

**Backend Setup:**
```bash
1. Install Java 17 JDK
2. Install Maven 3.9.x or Gradle 8.5
3. Install PostgreSQL 16 (or use Docker)
4. Clone repository
5. Create database: `createdb invoiceme`
6. Configure `application-dev.yml` with database connection
7. Run: `./mvnw spring-boot:run` or `./gradlew bootRun`
8. API available at: http://localhost:8080
9. API docs at: http://localhost:8080/swagger-ui.html
```

**Frontend Setup:**
```bash
1. Install Node.js 20.x
2. Install npm 10.2.4 or yarn 1.22.19
3. Clone repository
4. Install dependencies: `npm install` or `yarn install`
5. Create `.env.local` with API base URL: `NEXT_PUBLIC_API_URL=http://localhost:8080/api`
6. Run: `npm run dev` or `yarn dev`
7. Application available at: http://localhost:3000
```

**Database Setup:**
```bash
# PostgreSQL (Production)
createdb invoiceme
psql invoiceme < src/main/resources/db/migration/V1__Initial_schema.sql

# H2 (Testing - automatic via Spring Boot test configuration)
```

**Testing:**
```bash
# Backend tests
./mvnw test or ./gradlew test

# Frontend tests
npm test or yarn test

# E2E tests
npm run test:e2e or yarn test:e2e
```

---

## Implementation Guide

### Setup Steps

**Pre-implementation Checklist:**
1. ✅ Verify Java 17 and Node.js 20.x installed
2. ✅ Set up PostgreSQL database
3. ✅ Create project repositories (backend and frontend)
4. ✅ Initialize Spring Boot project with required dependencies
5. ✅ Initialize Next.js project with TypeScript
6. ✅ Configure development environment (database connection, API URLs)
7. ✅ Set up Git repository and initial commit
8. ✅ Configure CI/CD pipeline (optional for MVP)

### Implementation Steps

**Phase 1: Foundation Setup**
1. Create Spring Boot project structure with domain, application, infrastructure, api layers
2. Create Next.js project with App Router structure
3. Set up database schema (customers, invoices, invoice_line_items, payments tables)
4. Configure Spring Security for authentication
5. Set up API client in frontend with authentication

**Phase 2: Customer Management (Vertical Slice 1)**
1. Implement Customer domain entity with business logic
2. Implement CreateCustomerCommand and handler
3. Implement GetCustomerQuery and ListCustomersQuery with handlers
4. Implement UpdateCustomerCommand and DeleteCustomerCommand with handlers
5. Create CustomerController with REST endpoints
6. Create CustomerDto and mapper
7. Create CustomerRepository (JPA)
8. Create frontend: Customer list page, create/edit pages
9. Create frontend: Customer API client and useCustomers hook
10. Write unit tests for Customer domain
11. Write integration tests for Customer API endpoints
12. Write E2E tests for customer management flow

**Phase 3: Invoice Management (Vertical Slice 2)**
1. Implement Invoice domain entity with lifecycle management
2. Implement InvoiceStatus enum and state transition logic
3. Implement InvoiceLineItem value object
4. Implement CreateInvoiceCommand and handler
5. Implement AddLineItemCommand and handler
6. Implement UpdateInvoiceCommand (only for Draft state)
7. Implement SendInvoiceCommand and handler
8. Implement GetInvoiceQuery and ListInvoicesQuery with handlers
9. Create InvoiceController with REST endpoints
10. Create InvoiceDto, InvoiceLineItemDto and mappers
11. Create InvoiceRepository (JPA)
12. Create frontend: Invoice list page, create/edit pages
13. Create frontend: Invoice API client and useInvoices hook
14. Write unit tests for Invoice domain (including state transitions)
15. Write integration tests for Invoice API endpoints
16. Write E2E tests for invoice creation flow

**Phase 4: Payment Processing (Vertical Slice 3)**
1. Implement Payment domain entity with business rules
2. Implement RecordPaymentCommand and handler
3. Implement payment application logic (update invoice balance, trigger state transition)
4. Implement GetPaymentQuery and ListPaymentsQuery with handlers
5. Create PaymentController with REST endpoints
6. Create PaymentDto and mapper
7. Create PaymentRepository (JPA)
8. Create frontend: Payment list page, record payment page
9. Create frontend: Payment API client and usePayments hook
10. Write unit tests for Payment domain
11. Write integration tests for Payment API endpoints
12. Write E2E tests for payment recording flow

**Phase 5: Integration and End-to-End Testing**
1. Write integration test: Complete Customer → Invoice → Payment flow
2. Verify state transitions work correctly
3. Verify balance calculations are accurate
4. Write E2E test: Complete user journey from login to payment recording
5. Fix any issues discovered during testing

**Phase 6: Authentication**
1. Implement login endpoint in backend
2. Implement Spring Security configuration
3. Create login page in frontend
4. Implement authentication flow (store token, redirect to dashboard)
5. Protect all API endpoints with authentication
6. Add authentication to API client (include token in headers)
7. Test authentication flow

### Testing Strategy

**Unit Tests:**
- Test domain entities: Customer, Invoice, Payment business logic
- Test value objects: Validation and immutability
- Test command/query handlers: Business logic execution
- Mock dependencies (repositories, external services)
- Target: 80%+ code coverage on domain and application layers

**Integration Tests:**
- Test REST API endpoints with TestRestTemplate or MockMvc
- Test database operations (use H2 in-memory database)
- Test authentication and authorization
- Test error handling and validation
- Use @SpringBootTest for full application context

**E2E Tests:**
- Test complete user flows with Playwright
- Test Customer → Invoice → Payment flow end-to-end
- Test authentication flow
- Test UI interactions and form submissions
- Run against test environment with real database

**Test Data:**
- Use factories/builders for creating test entities
- Create test fixtures for common scenarios
- Use @Sql annotations for database setup in integration tests

### Acceptance Criteria

**Customer Management:**
1. ✅ User can create a customer with required fields (name, email)
2. ✅ Created customer is persisted and can be retrieved by ID
3. ✅ User can update customer details
4. ✅ User can delete a customer (with business rule for associated invoices)
5. ✅ User can list all customers
6. ✅ Validation errors are displayed for invalid input

**Invoice Management:**
1. ✅ User can create an invoice in Draft state
2. ✅ User can add multiple line items to an invoice
3. ✅ Invoice balance is calculated correctly (sum of quantity × unit price)
4. ✅ User can update invoice details only in Draft state
5. ✅ User can mark invoice as Sent (state transition Draft → Sent)
6. ✅ Sent invoices cannot be modified
7. ✅ User can retrieve invoice by ID with all line items
8. ✅ User can list invoices with filters (status, customer)

**Payment Processing:**
1. ✅ User can record a payment associated with an invoice
2. ✅ Payment amount is applied to invoice balance
3. ✅ Invoice balance is updated immediately after payment
4. ✅ Invoice transitions to Paid state when balance reaches zero
5. ✅ User can retrieve payment by ID
6. ✅ User can list all payments for an invoice

**Invoice Lifecycle:**
1. ✅ State transitions are enforced: Draft → Sent → Paid
2. ✅ Invalid state transitions are prevented
3. ✅ Balance calculations are accurate throughout lifecycle

**User Authentication:**
1. ✅ User can log in with credentials
2. ✅ Login screen is provided
3. ✅ Authenticated users can access application features
4. ✅ Unauthenticated users are denied access
5. ✅ All API endpoints require authentication

**Integration Testing:**
1. ✅ End-to-end test exists for complete Customer → Invoice → Payment flow
2. ✅ Test verifies: Customer creation → Invoice creation with line items → Payment application
3. ✅ Test verifies correct balance calculations throughout flow
4. ✅ Test verifies state transitions work correctly
5. ✅ All integration tests pass

---

## Developer Resources

### File Paths Reference

**Backend - Domain:**
- `src/main/java/com/invoiceme/domain/customer/Customer.java`
- `src/main/java/com/invoiceme/domain/customer/CustomerId.java`
- `src/main/java/com/invoiceme/domain/invoice/Invoice.java`
- `src/main/java/com/invoiceme/domain/invoice/InvoiceId.java`
- `src/main/java/com/invoiceme/domain/invoice/InvoiceStatus.java`
- `src/main/java/com/invoiceme/domain/invoice/InvoiceLineItem.java`
- `src/main/java/com/invoiceme/domain/payment/Payment.java`
- `src/main/java/com/invoiceme/domain/payment/PaymentId.java`

**Backend - Application:**
- `src/main/java/com/invoiceme/application/commands/customer/`
- `src/main/java/com/invoiceme/application/queries/customer/`
- `src/main/java/com/invoiceme/application/commands/invoice/`
- `src/main/java/com/invoiceme/application/queries/invoice/`
- `src/main/java/com/invoiceme/application/commands/payment/`
- `src/main/java/com/invoiceme/application/queries/payment/`

**Backend - API:**
- `src/main/java/com/invoiceme/api/customers/CustomerController.java`
- `src/main/java/com/invoiceme/api/invoices/InvoiceController.java`
- `src/main/java/com/invoiceme/api/payments/PaymentController.java`

**Backend - Infrastructure:**
- `src/main/java/com/invoiceme/infrastructure/persistence/`
- `src/main/java/com/invoiceme/infrastructure/security/`

**Frontend - Pages:**
- `src/app/(auth)/login/page.tsx`
- `src/app/(dashboard)/customers/page.tsx`
- `src/app/(dashboard)/customers/[id]/page.tsx`
- `src/app/(dashboard)/customers/new/page.tsx`
- `src/app/(dashboard)/invoices/page.tsx`
- `src/app/(dashboard)/invoices/[id]/page.tsx`
- `src/app/(dashboard)/invoices/new/page.tsx`
- `src/app/(dashboard)/payments/page.tsx`
- `src/app/(dashboard)/payments/new/page.tsx`

**Frontend - Components:**
- `src/components/ui/`
- `src/components/forms/`
- `src/components/layout/`

**Frontend - MVVM:**
- `src/lib/hooks/useCustomers.ts`
- `src/lib/hooks/useInvoices.ts`
- `src/lib/hooks/usePayments.ts`
- `src/lib/api/customers.ts`
- `src/lib/api/invoices.ts`
- `src/lib/api/payments.ts`
- `src/lib/api/client.ts`

**Testing:**
- `src/test/java/com/invoiceme/domain/`
- `src/test/java/com/invoiceme/application/`
- `src/test/java/com/invoiceme/api/`
- `src/test/java/com/invoiceme/integration/`
- `tests/e2e/`

### Key Code Locations

**Domain Logic:**
- Customer entity: `src/main/java/com/invoiceme/domain/customer/Customer.java`
- Invoice entity with lifecycle: `src/main/java/com/invoiceme/domain/invoice/Invoice.java`
- Payment entity: `src/main/java/com/invoiceme/domain/payment/Payment.java`
- State transition logic: `Invoice.send()` and `Invoice.applyPayment()` methods

**API Endpoints:**
- Customer endpoints: `src/main/java/com/invoiceme/api/customers/CustomerController.java`
- Invoice endpoints: `src/main/java/com/invoiceme/api/invoices/InvoiceController.java`
- Payment endpoints: `src/main/java/com/invoiceme/api/payments/PaymentController.java`

**Authentication:**
- Security configuration: `src/main/java/com/invoiceme/infrastructure/security/SecurityConfig.java`
- Login endpoint: TBD in authentication implementation

**Frontend ViewModels:**
- Customer operations: `src/lib/hooks/useCustomers.ts`
- Invoice operations: `src/lib/hooks/useInvoices.ts`
- Payment operations: `src/lib/hooks/usePayments.ts`

### Testing Locations

**Backend Tests:**
- Unit tests: `src/test/java/com/invoiceme/domain/` and `src/test/java/com/invoiceme/application/`
- Integration tests: `src/test/java/com/invoiceme/api/` and `src/test/java/com/invoiceme/integration/`

**Frontend Tests:**
- Unit tests: Co-located with components or in `__tests__` directories
- E2E tests: `tests/e2e/`

### Documentation to Update

- `README.md` - Add project overview, setup instructions, architecture overview
- `docs/API.md` - Document all REST API endpoints (or use SpringDoc OpenAPI)
- `docs/ARCHITECTURE.md` - Document architecture decisions, DDD patterns, CQRS implementation
- `CHANGELOG.md` - Track changes and features

---

## UX/UI Considerations

**UI Components Affected:**
- Login page: User authentication form
- Customer list page: Table showing all customers with search/filter
- Customer detail/edit page: Form for creating/editing customers
- Invoice list page: Table showing invoices with status indicators
- Invoice detail page: Display invoice with line items, status, balance
- Invoice create/edit page: Form for creating invoices with line item management
- Payment list page: Table showing payments
- Payment record page: Form for recording payments against invoices
- Dashboard/home page: Overview of customers, invoices, payments

**UX Flow Changes:**
- **Current Flow:** None (new application)
- **New Flow:**
  1. Login → Dashboard
  2. Dashboard → Customer List → Create/Edit Customer
  3. Dashboard → Invoice List → Create Invoice → Add Line Items → Send Invoice
  4. Dashboard → Payment List → Record Payment → Select Invoice → Enter Amount
  5. Invoice Detail → View Payments → Record Payment

**Visual/Interaction Patterns:**
- **Design System:** Establish consistent design system with:
  - Color scheme: Professional business colors (blues, grays)
  - Typography: Clear, readable fonts
  - Spacing: Consistent padding and margins
  - Components: Reusable UI components (Button, Input, Table, Card)
- **Status Indicators:** Visual indicators for invoice status (Draft, Sent, Paid)
  - Draft: Gray/yellow badge
  - Sent: Blue badge
  - Paid: Green badge
- **Responsive Design:** Support desktop, tablet, and mobile views
- **Loading States:** Show loading spinners during API calls
- **Error Messages:** Display user-friendly error messages for validation and API errors
- **Success Feedback:** Show success notifications after successful operations

**Accessibility:**
- Keyboard navigation: All interactive elements accessible via keyboard
- Screen reader compatibility: Proper ARIA labels and semantic HTML
- Color contrast: Meet WCAG AA standards
- Focus indicators: Clear focus states for all interactive elements

**User Feedback:**
- **Loading States:** Spinner or skeleton screens during data fetching
- **Error Messages:** Inline validation errors, toast notifications for API errors
- **Success Confirmations:** Toast notifications or success messages after operations
- **Progress Indicators:** Show progress for multi-step processes (invoice creation)

---

## Testing Approach

**Test Framework:**
- **Backend:** JUnit 5.10.0 with Mockito 5.7.0 for unit tests, Spring Boot Test for integration tests
- **Frontend:** Jest 29.7.0 with React Testing Library 14.1.2 for unit/component tests, Playwright 1.41.0 for E2E tests

**Test Strategy:**

**Backend Unit Tests:**
- Test domain entities: Customer, Invoice, Payment business logic
- Test value objects: Validation and immutability
- Test command/query handlers: Business logic execution
- Mock dependencies: Repositories, external services
- Target coverage: 80%+ on domain and application layers

**Backend Integration Tests:**
- Test REST API endpoints: Use TestRestTemplate or MockMvc
- Test database operations: Use H2 in-memory database
- Test authentication: Verify security configuration
- Test error handling: Verify proper error responses
- Use @SpringBootTest for full application context

**Frontend Unit/Component Tests:**
- Test React components: Render, user interactions, props
- Test custom hooks: State management, API calls
- Test form validation: Zod schema validation
- Mock API calls: Use MSW (Mock Service Worker) or jest.mock

**Frontend E2E Tests:**
- Test complete user flows: Customer → Invoice → Payment flow
- Test authentication: Login flow
- Test UI interactions: Form submissions, navigation
- Run against test environment with real backend

**Coverage:**
- Unit test coverage: 80%+ on domain and application layers (backend), 70%+ on components and hooks (frontend)
- Integration coverage: All critical API endpoints
- E2E coverage: Complete user journeys (Customer → Invoice → Payment flow)
- Ensure all acceptance criteria have corresponding tests

**Mock/Stub Strategies:**
- **Backend:** Mockito for mocking repositories and services
- **Frontend:** MSW for mocking API responses, jest.mock for module mocking
- **E2E:** Use test database with seed data

---

## Deployment Strategy

### Deployment Steps

**Development Environment:**
1. Developer runs application locally
2. Uses H2 database for testing
3. Frontend connects to local backend (http://localhost:8080)

**Staging Environment:**
1. Build backend: `./mvnw clean package` or `./gradlew build`
2. Build frontend: `npm run build` or `yarn build`
3. Deploy backend to staging server (Spring Boot JAR)
4. Deploy frontend to staging server (Next.js static export or server)
5. Configure PostgreSQL database on staging
6. Run database migrations
7. Configure environment variables
8. Verify deployment

**Production Environment:**
1. Build production artifacts (backend JAR, frontend build)
2. Run tests: `./mvnw test` and `npm test`
3. Deploy to production server (AWS/Azure)
4. Configure production PostgreSQL database
5. Run database migrations
6. Configure production environment variables
7. Set up monitoring and logging
8. Verify production deployment
9. Monitor for issues

### Rollback Plan

**If Issues Detected:**
1. Revert to previous Git commit
2. Rebuild artifacts from previous version
3. Redeploy previous version to production
4. Restore database backup if needed
5. Verify rollback successful
6. Investigate root cause of issues

### Monitoring

**What to Watch After Deployment:**
- **Error Rates:** Monitor application logs for errors
- **Response Times:** API response times (target: < 200ms)
- **Database Performance:** Query performance, connection pool usage
- **User Feedback:** Monitor user-reported issues
- **Authentication Issues:** Failed login attempts, token expiration issues

**Monitoring Tools:**
- Application logs: Spring Boot logging, Next.js logging
- Database monitoring: PostgreSQL query performance
- API monitoring: Response times, error rates
- User analytics: Track user actions and errors (optional for MVP)

---


