# Code Quality Standards (4.1)

**Version:** 1.0  
**Date:** 2025-11-09  
**Status:** Active  
**Owner:** Master Test Architect (TEA)

---

## Purpose

This document establishes explicit code quality standards for the InvoiceMe project to:

- **Make requirements explicit for developers** - Clear, actionable guidelines that developers can follow
- **Ensure consistency across the codebase** - Uniform patterns and practices throughout all code
- **Provide clear guidance on DTOs, mappers, and Domain Events** - Specific patterns and best practices for boundary objects
- **Establish review criteria** - Clear checkpoints for code reviews to ensure quality standards are met

---

## 1. Data Transfer Objects (DTOs)

### 1.1 Purpose and Scope

DTOs are used to transfer data across architectural boundaries, specifically:
- **API Layer ↔ Application Layer**: Request/Response DTOs for REST endpoints
- **Application Layer ↔ Domain Layer**: DTOs should NOT expose domain entities directly

### 1.2 DTO Design Principles

#### 1.2.1 Immutability (Preferred)

**Standard:** DTOs SHOULD be immutable when possible.

**Implementation Options:**
- **Java Records** (Preferred for Java 14+):
```java
public record CustomerDto(
    UUID id,
    String name,
    String email
) {}
```

- **Immutable Classes** (Alternative):
```java
public class CustomerDto {
    private final UUID id;
    private final String name;
    private final String email;
    
    public CustomerDto(UUID id, String name, String email) {
        this.id = id;
        this.name = name;
        this.email = email;
    }
    
    // Getters only, no setters
    public UUID getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
}
```

#### 1.2.2 Mutable DTOs (When Required)

**Standard:** If mutability is required (e.g., for framework compatibility), use standard JavaBeans pattern with:
- Default constructor
- All-args constructor
- Getters and setters for all fields

**Example:**
```java
public class CustomerDto {
    private UUID id;
    private String name;
    private String email;
    
    // Default constructor (required for frameworks)
    public CustomerDto() {}
    
    // All-args constructor
    public CustomerDto(UUID id, String name, String email) {
        this.id = id;
        this.name = name;
        this.email = email;
    }
    
    // Getters and setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    // ... other getters/setters
}
```

### 1.3 DTO Naming Conventions

**Standard:** Follow consistent naming patterns:

- **Response DTOs**: `{Entity}Dto` (e.g., `CustomerDto`, `InvoiceDto`, `PaymentDto`)
- **Request DTOs**: `{Action}{Entity}Request` (e.g., `CreateCustomerRequest`, `UpdateInvoiceRequest`, `RecordPaymentRequest`)
- **Nested DTOs**: `{Entity}{Component}Dto` (e.g., `InvoiceLineItemDto`)

### 1.4 DTO Location

**Standard:** DTOs MUST be placed in the API layer package structure:

```
src/main/java/com/invoiceme/api/
├── customers/
│   ├── CustomerDto.java
│   └── CreateCustomerRequest.java
├── invoices/
│   ├── InvoiceDto.java
│   ├── InvoiceLineItemDto.java
│   └── CreateInvoiceRequest.java
└── payments/
    ├── PaymentDto.java
    └── RecordPaymentRequest.java
```

### 1.5 DTO Validation

**Standard:** Request DTOs MUST use Jakarta Bean Validation annotations:

```java
public class CreateCustomerRequest {
    @NotBlank(message = "Name is required")
    @Size(min = 1, max = 255, message = "Name must be between 1 and 255 characters")
    private String name;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;
    
    // ... constructors, getters, setters
}
```

**Review Criteria:**
- ✅ All request DTOs have validation annotations
- ✅ Validation messages are user-friendly
- ✅ Required fields are marked with `@NotBlank` or `@NotNull`
- ✅ String length constraints are specified
- ✅ Email/URL/format validations are applied where appropriate

---

## 2. Mappers

### 2.1 Purpose and Scope

Mappers convert between:
- **Domain Objects ↔ DTOs**: Domain entities to API DTOs and vice versa
- **Request DTOs ↔ Commands/Queries**: API requests to application layer commands/queries

### 2.2 Mapper Implementation Patterns

#### 2.2.1 Private Methods in Controllers (Current Pattern)

**Standard:** For simple mappings, use private methods in controllers.

**Example:**
```java
@RestController
@RequestMapping("/api/invoices")
public class InvoiceController {
    
    private InvoiceDto toDto(Invoice invoice) {
        List<InvoiceLineItemDto> lineItemDtos = invoice.getLineItems().stream()
                .map(this::toLineItemDto)
                .collect(Collectors.toList());
        
        return new InvoiceDto(
                invoice.getId(),
                invoice.getCustomerId(),
                invoice.getStatus(),
                lineItemDtos,
                invoice.getBalance(),
                invoice.getCreatedAt(),
                invoice.getUpdatedAt()
        );
    }
    
    private InvoiceLineItemDto toLineItemDto(InvoiceLineItem lineItem) {
        return new InvoiceLineItemDto(
                lineItem.getLineItemId(),
                lineItem.getDescription(),
                lineItem.getQuantity(),
                lineItem.getUnitPrice(),
                lineItem.getSubtotal()
        );
    }
}
```

**When to Use:**
- Simple, straightforward mappings
- Mappings are only used within a single controller
- No complex transformation logic required

#### 2.2.2 Dedicated Mapper Classes (Recommended for Complex Mappings)

**Standard:** For complex mappings or reusable mappings, create dedicated mapper classes.

**Example:**
```java
@Component
public class InvoiceMapper {
    
    public InvoiceDto toDto(Invoice invoice) {
        // Complex mapping logic
    }
    
    public Invoice toDomain(CreateInvoiceRequest request) {
        // Request to domain conversion
    }
}
```

**When to Use:**
- Complex transformation logic
- Mappings are reused across multiple controllers
- Need for dependency injection in mapping logic
- Testing mapper logic in isolation

#### 2.2.3 MapStruct (Future Consideration)

**Standard:** For large-scale projects with many DTOs, consider MapStruct for compile-time code generation.

**Benefits:**
- Type-safe mapping
- Compile-time validation
- Performance (no reflection)
- Reduced boilerplate code

**Review Criteria:**
- ✅ Mapper methods are clearly named (`toDto`, `toDomain`, `toEntity`)
- ✅ Mappings handle null values appropriately
- ✅ Nested objects are properly mapped
- ✅ Collections are properly converted
- ✅ No domain logic leaks into mappers
- ✅ Mappers are testable (if extracted to separate classes)

### 2.3 Mapper Naming Conventions

**Standard:** Follow consistent naming patterns:

- **Domain to DTO**: `toDto({Domain} domain)` → returns `{Entity}Dto`
- **DTO to Domain**: `toDomain({Entity}Dto dto)` → returns `{Domain}`
- **Request to Command**: `toCommand({Action}Request request)` → returns `{Action}Command`
- **Nested mappings**: `to{Component}Dto({Component} component)` → returns `{Component}Dto`

### 2.4 Mapper Location

**Standard:** Mappers SHOULD be placed in the same package as the DTOs they map:

```
src/main/java/com/invoiceme/api/
├── customers/
│   ├── CustomerDto.java
│   ├── CustomerMapper.java (if extracted)
│   └── CreateCustomerRequest.java
└── invoices/
    ├── InvoiceDto.java
    ├── InvoiceMapper.java (if extracted)
    └── InvoiceLineItemDto.java
```

---

## 3. Domain Events

### 3.1 Purpose and Scope

Domain Events represent something important that happened in the domain. They enable:
- **Decoupling**: Different parts of the system can react to domain changes
- **Audit Trail**: Track important business events
- **Integration**: Communicate with external systems
- **Event Sourcing**: (Future consideration)

### 3.2 Domain Event Design Principles

#### 3.2.1 Event Structure

**Standard:** Domain Events MUST be immutable and contain:
- **Event ID**: Unique identifier for the event
- **Aggregate ID**: Identifier of the aggregate that raised the event
- **Event Type**: Type of event (e.g., `CustomerCreated`, `InvoiceSent`, `PaymentRecorded`)
- **Timestamp**: When the event occurred
- **Event Data**: Relevant data for the event

**Example:**
```java
public record CustomerCreatedEvent(
    UUID eventId,
    UUID customerId,
    String customerName,
    String customerEmail,
    LocalDateTime occurredAt
) implements DomainEvent {
    
    public CustomerCreatedEvent(UUID customerId, String customerName, String customerEmail) {
        this(
            UUID.randomUUID(),
            customerId,
            customerName,
            customerEmail,
            LocalDateTime.now()
        );
    }
}
```

#### 3.2.2 Event Interface

**Standard:** All Domain Events MUST implement a common `DomainEvent` interface:

```java
public interface DomainEvent {
    UUID getEventId();
    UUID getAggregateId();
    LocalDateTime getOccurredAt();
    String getEventType();
}
```

#### 3.2.3 Event Naming Conventions

**Standard:** Domain Events MUST be named using past tense verbs:

- ✅ `CustomerCreated`
- ✅ `InvoiceSent`
- ✅ `PaymentRecorded`
- ✅ `InvoiceStatusChanged`
- ❌ `CreateCustomer` (present tense)
- ❌ `CustomerCreation` (noun)

### 3.3 Raising Domain Events

**Standard:** Domain Events SHOULD be raised from domain entities when important business events occur:

```java
@Entity
public class Invoice {
    @Transient
    private final List<DomainEvent> domainEvents = new ArrayList<>();
    
    public void markAsSent() {
        if (status != InvoiceStatus.DRAFT) {
            throw new IllegalStateException("Cannot mark invoice as Sent from " + status + " state.");
        }
        this.status = InvoiceStatus.SENT;
        this.updatedAt = LocalDateTime.now();
        
        // Raise domain event
        domainEvents.add(new InvoiceSentEvent(this.id, this.customerId, LocalDateTime.now()));
    }
    
    public List<DomainEvent> getDomainEvents() {
        return Collections.unmodifiableList(domainEvents);
    }
    
    public void clearDomainEvents() {
        domainEvents.clear();
    }
}
```

### 3.4 Publishing Domain Events

**Standard:** Domain Events MUST be published after successful persistence:

```java
@Service
public class CreateInvoiceCommandHandler {
    private final InvoiceRepository invoiceRepository;
    private final DomainEventPublisher eventPublisher;
    
    public Invoice handle(CreateInvoiceCommand command) {
        Invoice invoice = new Invoice(command.getCustomerId());
        Invoice saved = invoiceRepository.save(invoice);
        
        // Publish domain events
        saved.getDomainEvents().forEach(eventPublisher::publish);
        saved.clearDomainEvents();
        
        return saved;
    }
}
```

### 3.5 Domain Event Location

**Standard:** Domain Events SHOULD be placed in the domain package:

```
src/main/java/com/invoiceme/domain/
├── customer/
│   ├── Customer.java
│   └── events/
│       ├── CustomerCreatedEvent.java
│       └── CustomerUpdatedEvent.java
├── invoice/
│   ├── Invoice.java
│   └── events/
│       ├── InvoiceCreatedEvent.java
│       ├── InvoiceSentEvent.java
│       └── InvoicePaidEvent.java
└── payment/
    ├── Payment.java
    └── events/
        └── PaymentRecordedEvent.java
```

### 3.6 Domain Event Handlers

**Standard:** Event handlers SHOULD be placed in the application layer:

```
src/main/java/com/invoiceme/application/
└── events/
    ├── CustomerCreatedEventHandler.java
    ├── InvoiceSentEventHandler.java
    └── PaymentRecordedEventHandler.java
```

**Review Criteria:**
- ✅ Domain Events are immutable
- ✅ Events contain all necessary data
- ✅ Events are named using past tense
- ✅ Events are raised from domain entities
- ✅ Events are published after successful persistence
- ✅ Event handlers are in the application layer
- ✅ No business logic in event handlers (only side effects)

---

## 4. Code Review Criteria

### 4.1 DTO Review Checklist

**Before approving code with DTOs, verify:**

- [ ] DTOs are placed in the correct package (`api/{feature}/`)
- [ ] DTOs follow naming conventions (`{Entity}Dto`, `{Action}{Entity}Request`)
- [ ] Request DTOs have validation annotations
- [ ] DTOs are immutable when possible (records or immutable classes)
- [ ] DTOs do not expose domain entities directly
- [ ] DTOs do not contain business logic
- [ ] All fields have appropriate getters (and setters if mutable)
- [ ] Nested DTOs are properly structured

### 4.2 Mapper Review Checklist

**Before approving code with mappers, verify:**

- [ ] Mapper methods are clearly named (`toDto`, `toDomain`, etc.)
- [ ] Mappings handle null values appropriately
- [ ] Nested objects are properly mapped
- [ ] Collections are properly converted
- [ ] No domain logic leaks into mappers
- [ ] Mappers are testable (if extracted to separate classes)
- [ ] Mapper location follows package structure
- [ ] Complex mappings are extracted to dedicated mapper classes

### 4.3 Domain Event Review Checklist

**Before approving code with domain events, verify:**

- [ ] Domain Events are immutable
- [ ] Events implement `DomainEvent` interface
- [ ] Events are named using past tense
- [ ] Events contain all necessary data
- [ ] Events are raised from domain entities
- [ ] Events are published after successful persistence
- [ ] Event handlers are in the application layer
- [ ] No business logic in event handlers

### 4.4 General Code Quality Checklist

**Before approving any code, verify:**

- [ ] Code follows established patterns
- [ ] Code is consistent with existing codebase
- [ ] Code has appropriate unit tests
- [ ] Code has appropriate integration tests
- [ ] Code is properly documented
- [ ] Code follows naming conventions
- [ ] Code handles errors appropriately
- [ ] Code does not introduce security vulnerabilities

---

## 5. Examples and Anti-Patterns

### 5.1 Good DTO Example

```java
// ✅ GOOD: Immutable DTO with validation
public record CreateCustomerRequest(
    @NotBlank(message = "Name is required")
    @Size(min = 1, max = 255)
    String name,
    
    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    String email
) {}
```

### 5.2 Bad DTO Example

```java
// ❌ BAD: Exposes domain entity directly
@GetMapping("/{id}")
public ResponseEntity<Customer> getCustomer(@PathVariable UUID id) {
    Customer customer = getCustomerQueryHandler.handle(new GetCustomerQuery(id));
    return ResponseEntity.ok(customer); // ❌ Exposing domain entity
}

// ❌ BAD: No validation
public class CreateCustomerRequest {
    private String name; // ❌ No validation
    private String email; // ❌ No validation
}
```

### 5.3 Good Mapper Example

```java
// ✅ GOOD: Clear mapping with null handling
private InvoiceDto toDto(Invoice invoice) {
    if (invoice == null) {
        return null;
    }
    
    List<InvoiceLineItemDto> lineItemDtos = invoice.getLineItems() != null
        ? invoice.getLineItems().stream()
            .map(this::toLineItemDto)
            .collect(Collectors.toList())
        : Collections.emptyList();
    
    return new InvoiceDto(
        invoice.getId(),
        invoice.getCustomerId(),
        invoice.getStatus(),
        lineItemDtos,
        invoice.getBalance(),
        invoice.getCreatedAt(),
        invoice.getUpdatedAt()
    );
}
```

### 5.4 Bad Mapper Example

```java
// ❌ BAD: Business logic in mapper
private InvoiceDto toDto(Invoice invoice) {
    // ❌ Business logic should be in domain entity
    if (invoice.getBalance().compareTo(BigDecimal.ZERO) == 0) {
        invoice.markAsPaid(); // ❌ Side effect in mapper
    }
    
    return new InvoiceDto(/* ... */);
}
```

### 5.5 Good Domain Event Example

```java
// ✅ GOOD: Immutable event with all necessary data
public record InvoiceSentEvent(
    UUID eventId,
    UUID invoiceId,
    UUID customerId,
    BigDecimal amount,
    LocalDateTime occurredAt
) implements DomainEvent {
    
    public InvoiceSentEvent(UUID invoiceId, UUID customerId, BigDecimal amount) {
        this(UUID.randomUUID(), invoiceId, customerId, amount, LocalDateTime.now());
    }
    
    @Override
    public UUID getAggregateId() {
        return invoiceId;
    }
    
    @Override
    public String getEventType() {
        return "InvoiceSent";
    }
}
```

### 5.6 Bad Domain Event Example

```java
// ❌ BAD: Mutable event
public class InvoiceSentEvent implements DomainEvent {
    private UUID eventId; // ❌ Mutable
    private UUID invoiceId; // ❌ Mutable
    
    public void setEventId(UUID eventId) { // ❌ Setter
        this.eventId = eventId;
    }
}

// ❌ BAD: Present tense naming
public record CreateInvoiceEvent(...) {} // ❌ Should be InvoiceCreatedEvent
```

---

## 6. References

- **Tech Spec**: `docs/tech-spec.md` - Architecture patterns and technical approach
- **PRD**: `docs/PRD.md` - Product requirements and success criteria
- **Requirements Evaluation Report**: `docs/requirements-evaluation-report.md` - Code quality requirements

---

## 7. Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-09 | TEA | Initial version - Code Quality Standards (4.1) |

---

**Document Status:** Active  
**Next Review Date:** 2025-12-09  
**Owner:** Master Test Architect (TEA)

