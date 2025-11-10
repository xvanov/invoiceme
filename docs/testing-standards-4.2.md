# Testing Standards (4.2)

**Version:** 1.0  
**Date:** 2025-11-09  
**Status:** Active  
**Owner:** Master Test Architect (TEA)

---

## Purpose

This document establishes explicit testing standards for the InvoiceMe project to:

- **Make the mandatory requirement explicit** - Clear, non-negotiable testing requirements that MUST be met
- **Provide clear guidance on integration test scope** - Specific guidance on what integration tests must cover
- **Establish review criteria** - Clear checkpoints for code reviews to ensure testing standards are met
- **Ensure consistency across future features** - Uniform testing patterns and practices for all new features

---

## 1. Mandatory Testing Requirements

### 1.1 Testing is Mandatory

**Standard:** **ALL** new features and code changes MUST include appropriate tests. Testing is not optional.

**Scope:**
- ✅ Unit tests for domain logic
- ✅ Integration tests for API endpoints
- ✅ Integration tests for complete business flows
- ✅ E2E tests for critical user journeys

**Exceptions:** None. All code MUST be tested.

### 1.2 Test Coverage Requirements

**Standard:** Minimum test coverage requirements:

- **Domain Layer**: 80%+ code coverage
- **Application Layer**: 80%+ code coverage
- **API Layer**: 100% endpoint coverage (all endpoints must have integration tests)
- **Frontend Components**: 70%+ code coverage
- **Frontend Hooks**: 80%+ code coverage

**Measurement:**
- Backend: JaCoCo code coverage reports
- Frontend: Jest coverage reports
- Integration tests: Manual verification of endpoint coverage

### 1.3 Test Quality Requirements

**Standard:** Tests MUST meet quality standards:

- ✅ Tests are deterministic (same input = same output)
- ✅ Tests are independent (no test depends on another)
- ✅ Tests are fast (unit tests < 1s, integration tests < 10s)
- ✅ Tests are readable (clear naming, good structure)
- ✅ Tests are maintainable (DRY, reusable test utilities)

---

## 2. Integration Test Scope

### 2.1 Mandatory Integration Test Coverage

**Standard:** Integration tests MUST cover the following:

#### 2.1.1 API Endpoint Coverage

**Requirement:** **ALL** REST API endpoints MUST have integration tests.

**Coverage Required:**
- ✅ **Customer Endpoints**:
  - POST `/api/customers` - Create customer
  - GET `/api/customers/{id}` - Retrieve customer
  - GET `/api/customers` - List customers
  - PUT `/api/customers/{id}` - Update customer
  - DELETE `/api/customers/{id}` - Delete customer

- ✅ **Invoice Endpoints**:
  - POST `/api/invoices` - Create invoice
  - GET `/api/invoices/{id}` - Retrieve invoice
  - GET `/api/invoices` - List invoices (with filters)
  - PUT `/api/invoices/{id}` - Update invoice
  - POST `/api/invoices/{id}/send` - Mark invoice as sent
  - POST `/api/invoices/{id}/items` - Add line item

- ✅ **Payment Endpoints**:
  - POST `/api/payments` - Record payment
  - GET `/api/payments/{id}` - Retrieve payment
  - GET `/api/payments/invoice/{invoiceId}` - List payments for invoice

- ✅ **Authentication Endpoints**:
  - POST `/api/auth/login` - Login
  - POST `/api/auth/logout` - Logout (if implemented)

#### 2.1.2 Business Flow Coverage

**Requirement:** Integration tests MUST verify complete business flows.

**Mandatory Flows:**
- ✅ **Customer → Invoice → Payment Flow**:
  - Create customer
  - Create invoice for customer
  - Add line items to invoice
  - Mark invoice as sent
  - Record payment for invoice
  - Verify invoice balance updates
  - Verify invoice status transitions

- ✅ **Invoice Lifecycle Flow**:
  - Create invoice (Draft state)
  - Add line items
  - Mark invoice as sent (Draft → Sent)
  - Record payment (Sent → Paid when balance = 0)
  - Verify state transitions are enforced
  - Verify invalid transitions are prevented

- ✅ **Balance Calculation Flow**:
  - Create invoice with line items
  - Verify balance calculation (sum of line items)
  - Record partial payment
  - Verify balance reduction
  - Record full payment
  - Verify balance = 0 and status = Paid

#### 2.1.3 Error Handling Coverage

**Requirement:** Integration tests MUST verify error handling.

**Coverage Required:**
- ✅ **Validation Errors**:
  - Invalid request data (missing required fields)
  - Invalid data format (invalid email, negative amounts)
  - Invalid data constraints (string length, number ranges)

- ✅ **Business Rule Violations**:
  - Invalid state transitions (e.g., Paid → Draft)
  - Invalid operations (e.g., add line item to Sent invoice)
  - Overpayment prevention (payment > balance)

- ✅ **Resource Not Found**:
  - Retrieve non-existent customer
  - Retrieve non-existent invoice
  - Update non-existent resource

- ✅ **Authentication/Authorization**:
  - Unauthenticated requests (missing token)
  - Invalid authentication (invalid token)
  - Unauthorized access (if role-based access is implemented)

### 2.2 Integration Test Structure

**Standard:** Integration tests MUST follow this structure:

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@DisplayName("Feature Name Integration Test")
class FeatureIntegrationTest {
    
    @LocalServerPort
    private int port;
    
    @Autowired
    private TestRestTemplate restTemplate;
    
    @Autowired
    private Repository repository; // For test data setup
    
    private String baseUrl;
    private String authToken;
    private HttpHeaders headers;
    
    @BeforeEach
    void setUp() {
        baseUrl = "http://localhost:" + port;
        
        // Clean up test data
        repository.deleteAll();
        
        // Set up authentication
        authToken = authenticate();
        headers = createAuthHeaders(authToken);
    }
    
    @Test
    @DisplayName("Should create resource successfully")
    void testCreateResource() {
        // Given
        CreateResourceRequest request = new CreateResourceRequest(/* ... */);
        
        // When
        ResponseEntity<ResourceDto> response = restTemplate.postForEntity(
            baseUrl + "/api/resources",
            new HttpEntity<>(request, headers),
            ResourceDto.class
        );
        
        // Then
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        // ... additional assertions
    }
    
    // Additional test methods...
}
```

### 2.3 Integration Test Naming Conventions

**Standard:** Integration tests MUST follow naming conventions:

- **Test Class**: `{Feature}IntegrationTest` (e.g., `CustomerIntegrationTest`, `InvoiceIntegrationTest`)
- **Flow Test Class**: `{Feature1}{Feature2}FlowTest` (e.g., `CustomerInvoicePaymentFlowTest`)
- **Test Method**: `test{Action}{ExpectedOutcome}` (e.g., `testCreateCustomerSuccessfully`, `testUpdateInvoiceWithInvalidDataThrowsException`)

### 2.4 Integration Test Location

**Standard:** Integration tests MUST be placed in the test package structure:

```
src/test/java/com/invoiceme/
├── api/
│   ├── customers/
│   │   └── CustomerControllerTest.java
│   ├── invoices/
│   │   └── InvoiceControllerTest.java
│   └── payments/
│       └── PaymentControllerTest.java
└── integration/
    └── CustomerInvoicePaymentFlowTest.java
```

---

## 3. Unit Test Requirements

### 3.1 Domain Layer Unit Tests

**Standard:** **ALL** domain entities MUST have unit tests.

**Coverage Required:**
- ✅ Business logic methods
- ✅ State transitions
- ✅ Validation rules
- ✅ Business rule enforcement
- ✅ Error conditions

**Example:**
```java
@DisplayName("Invoice Domain Tests")
class InvoiceTest {
    
    @Test
    @DisplayName("Should calculate balance from line items")
    void testCalculateBalance() {
        // Given
        Invoice invoice = new Invoice(customerId);
        invoice.addLineItem(new InvoiceLineItem(description, quantity, unitPrice));
        
        // When
        BigDecimal balance = invoice.getBalance();
        
        // Then
        assertEquals(expectedBalance, balance);
    }
    
    @Test
    @DisplayName("Should prevent adding line items to sent invoice")
    void testAddLineItemToSentInvoiceThrowsException() {
        // Given
        Invoice invoice = new Invoice(customerId);
        invoice.markAsSent();
        
        // When/Then
        assertThrows(IllegalStateException.class, () -> {
            invoice.addLineItem(new InvoiceLineItem(/* ... */));
        });
    }
}
```

### 3.2 Application Layer Unit Tests

**Standard:** **ALL** command and query handlers MUST have unit tests.

**Coverage Required:**
- ✅ Command execution
- ✅ Query execution
- ✅ Error handling
- ✅ Business rule enforcement

**Example:**
```java
@ExtendWith(MockitoExtension.class)
@DisplayName("Create Customer Command Handler Tests")
class CreateCustomerCommandHandlerTest {
    
    @Mock
    private CustomerRepository customerRepository;
    
    @InjectMocks
    private CreateCustomerCommandHandler handler;
    
    @Test
    @DisplayName("Should create customer successfully")
    void testCreateCustomer() {
        // Given
        CreateCustomerCommand command = new CreateCustomerCommand("Name", "email@example.com");
        Customer savedCustomer = new Customer(/* ... */);
        when(customerRepository.save(any(Customer.class))).thenReturn(savedCustomer);
        
        // When
        Customer result = handler.handle(command);
        
        // Then
        assertNotNull(result);
        verify(customerRepository).save(any(Customer.class));
    }
}
```

---

## 4. E2E Test Requirements

### 4.1 Critical User Journey Coverage

**Standard:** E2E tests MUST cover critical user journeys.

**Mandatory Journeys:**
- ✅ **Customer Management Journey**:
  - Login
  - Create customer
  - View customer list
  - Update customer
  - Delete customer

- ✅ **Invoice Management Journey**:
  - Create invoice
  - Add line items
  - Mark invoice as sent
  - View invoice details

- ✅ **Payment Recording Journey**:
  - Record payment
  - View payment history
  - Verify invoice balance updates

- ✅ **Complete Business Flow Journey**:
  - Create customer
  - Create invoice for customer
  - Add line items
  - Mark invoice as sent
  - Record payment
  - Verify invoice status and balance

### 4.2 E2E Test Structure

**Standard:** E2E tests MUST use Playwright and follow this structure:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Customer Management', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');
    
    // Login
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Wait for navigation
    await page.waitForURL('/customers');
  });
  
  test('should create customer successfully', async ({ page }) => {
    // Given
    await page.goto('/customers');
    
    // When
    await page.click('button:has-text("Create Customer")');
    await page.fill('[name="name"]', 'Test Customer');
    await page.fill('[name="email"]', 'test@example.com');
    await page.click('button[type="submit"]');
    
    // Then
    await expect(page.locator('text=Test Customer')).toBeVisible();
  });
});
```

---

## 5. Test Data Management

### 5.1 Test Data Setup

**Standard:** Tests MUST use proper test data setup.

**Requirements:**
- ✅ Tests clean up after themselves (`@BeforeEach` / `@AfterEach`)
- ✅ Tests use test fixtures/builders for creating test data
- ✅ Tests do not depend on external data
- ✅ Tests are isolated (no shared state)

**Example:**
```java
@BeforeEach
void setUp() {
    // Clean up test data
    paymentRepository.deleteAll();
    invoiceRepository.deleteAll();
    customerRepository.deleteAll();
    
    // Set up test data
    Customer testCustomer = Customer.builder()
        .name("Test Customer")
        .email("test@example.com")
        .build();
    customerRepository.save(testCustomer);
}
```

### 5.2 Test Data Builders

**Standard:** Use builder pattern for test data creation.

**Example:**
```java
public class CustomerTestBuilder {
    private UUID id = UUID.randomUUID();
    private String name = "Test Customer";
    private String email = "test@example.com";
    
    public CustomerTestBuilder withId(UUID id) {
        this.id = id;
        return this;
    }
    
    public CustomerTestBuilder withName(String name) {
        this.name = name;
        return this;
    }
    
    public CustomerTestBuilder withEmail(String email) {
        this.email = email;
        return this;
    }
    
    public Customer build() {
        return new Customer(id, name, email);
    }
}
```

---

## 6. Code Review Criteria

### 6.1 Integration Test Review Checklist

**Before approving code with integration tests, verify:**

- [ ] **ALL** API endpoints have integration tests
- [ ] Integration tests cover complete business flows
- [ ] Integration tests verify error handling
- [ ] Integration tests use `@SpringBootTest` with `RANDOM_PORT`
- [ ] Integration tests use `@ActiveProfiles("test")`
- [ ] Integration tests clean up test data
- [ ] Integration tests are independent
- [ ] Integration tests have clear naming
- [ ] Integration tests follow Given-When-Then structure
- [ ] Integration tests verify authentication (if required)

### 6.2 Unit Test Review Checklist

**Before approving code with unit tests, verify:**

- [ ] **ALL** domain entities have unit tests
- [ ] **ALL** command/query handlers have unit tests
- [ ] Unit tests cover business logic
- [ ] Unit tests cover error conditions
- [ ] Unit tests are fast (< 1s)
- [ ] Unit tests are independent
- [ ] Unit tests use mocks appropriately
- [ ] Unit tests have clear naming
- [ ] Unit tests follow Given-When-Then structure

### 6.3 E2E Test Review Checklist

**Before approving code with E2E tests, verify:**

- [ ] E2E tests cover critical user journeys
- [ ] E2E tests use Playwright
- [ ] E2E tests are independent
- [ ] E2E tests have clear naming
- [ ] E2E tests wait for elements properly
- [ ] E2E tests verify expected outcomes

### 6.4 General Test Review Checklist

**Before approving any code, verify:**

- [ ] Tests are mandatory (no code without tests)
- [ ] Tests meet coverage requirements
- [ ] Tests are deterministic
- [ ] Tests are independent
- [ ] Tests are fast
- [ ] Tests are readable
- [ ] Tests are maintainable
- [ ] Tests follow naming conventions
- [ ] Tests follow project structure

---

## 7. Examples and Anti-Patterns

### 7.1 Good Integration Test Example

```java
// ✅ GOOD: Complete integration test with proper structure
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@DisplayName("Customer Integration Test")
class CustomerIntegrationTest {
    
    @LocalServerPort
    private int port;
    
    @Autowired
    private TestRestTemplate restTemplate;
    
    @Autowired
    private CustomerRepository customerRepository;
    
    private String baseUrl;
    private String authToken;
    
    @BeforeEach
    void setUp() {
        baseUrl = "http://localhost:" + port;
        customerRepository.deleteAll();
        authToken = authenticate();
    }
    
    @Test
    @DisplayName("Should create customer successfully")
    void testCreateCustomerSuccessfully() {
        // Given
        CreateCustomerRequest request = new CreateCustomerRequest("Test Customer", "test@example.com");
        HttpHeaders headers = createAuthHeaders(authToken);
        
        // When
        ResponseEntity<CustomerDto> response = restTemplate.postForEntity(
            baseUrl + "/api/customers",
            new HttpEntity<>(request, headers),
            CustomerDto.class
        );
        
        // Then
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Test Customer", response.getBody().getName());
        assertEquals("test@example.com", response.getBody().getEmail());
    }
}
```

### 7.2 Bad Integration Test Example

```java
// ❌ BAD: Missing authentication, no cleanup, no structure
@Test
void testCreate() {
    CustomerDto dto = restTemplate.postForObject("/api/customers", request, CustomerDto.class);
    assertNotNull(dto); // ❌ Minimal assertions
    // ❌ No cleanup
    // ❌ No authentication
    // ❌ No proper structure
}
```

### 7.3 Good Unit Test Example

```java
// ✅ GOOD: Comprehensive unit test with clear structure
@DisplayName("Invoice Domain Tests")
class InvoiceTest {
    
    @Test
    @DisplayName("Should prevent adding line items to sent invoice")
    void testAddLineItemToSentInvoiceThrowsException() {
        // Given
        Invoice invoice = new Invoice(customerId);
        invoice.markAsSent();
        InvoiceLineItem lineItem = new InvoiceLineItem(description, quantity, unitPrice);
        
        // When/Then
        IllegalStateException exception = assertThrows(
            IllegalStateException.class,
            () -> invoice.addLineItem(lineItem)
        );
        
        assertEquals("Cannot add line items to invoice in SENT state.", exception.getMessage());
    }
}
```

### 7.4 Bad Unit Test Example

```java
// ❌ BAD: No structure, minimal assertions, no clear intent
@Test
void testInvoice() {
    Invoice invoice = new Invoice();
    invoice.markAsSent();
    invoice.addLineItem(new InvoiceLineItem());
    // ❌ No assertion
    // ❌ No clear test intent
    // ❌ No proper structure
}
```

---

## 8. Test Execution and CI/CD

### 8.1 Test Execution Requirements

**Standard:** Tests MUST be executable via build tools:

- **Backend**: `mvn test` (runs all unit and integration tests)
- **Frontend**: `npm test` (runs all unit tests)
- **E2E**: `npm run test:e2e` (runs all E2E tests)

### 8.2 CI/CD Integration

**Standard:** Tests MUST run in CI/CD pipeline:

- ✅ All tests run on every commit
- ✅ Tests must pass before merge
- ✅ Test coverage reports are generated
- ✅ Test failures block deployment

---

## 9. References

- **Tech Spec**: `docs/tech-spec.md` - Testing strategy and approach
- **PRD**: `docs/PRD.md` - Testing requirements
- **Requirements Evaluation Report**: `docs/requirements-evaluation-report.md` - Integration test requirements
- **Story 1.4**: `docs/stories/story-mvp-invoicing-system-4.md` - Performance testing

---

## 10. Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-09 | TEA | Initial version - Testing Standards (4.2) |

---

**Document Status:** Active  
**Next Review Date:** 2025-12-09  
**Owner:** Master Test Architect (TEA)

