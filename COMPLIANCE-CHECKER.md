# InvoiceMe Requirements Compliance Checker

This directory contains scripts to verify that the InvoiceMe project meets all assessment requirements.

## Quick Start

### Option 1: Dashboard View (Recommended for Video)
Simple, clean dashboard showing all requirements at a glance:

```bash
./compliance-dashboard.sh
```

**Best for:** Video demonstrations, quick overview, presentations

### Option 2: Detailed Checker
Comprehensive verification with detailed output:

```bash
./check-compliance.sh
```

**Best for:** Development verification, CI/CD integration, detailed analysis

## What These Scripts Check

### 1. Project Goal & Architecture
- ✅ ERP-style invoicing system
- ✅ Domain-Driven Design (DDD)
- ✅ CQRS Pattern (Commands/Queries separation)
- ✅ Vertical Slice Architecture (VSA)
- ✅ Clean Architecture layer separation

### 2. Business Functionality
- ✅ **Customer Domain**: Create, Update, Delete, Retrieve, List
- ✅ **Invoice Domain**: Create (Draft), Update, Mark as Sent, Retrieve, List
- ✅ **Payment Domain**: Record Payment, Retrieve, List
- ✅ **Invoice Lifecycle**: Draft → Sent → Paid transitions
- ✅ **Line Items**: Multiple line items per invoice
- ✅ **Balance Calculation**: Running balance and payment application
- ✅ **Authentication**: Login functionality

### 3. Technical Stack
- ✅ Backend: Java with Spring Boot
- ✅ Frontend: TypeScript with Next.js
- ✅ Database: PostgreSQL (production), H2 (testing)
- ✅ RESTful APIs
- ✅ MVVM Frontend Architecture

### 4. Code Quality & Testing
- ✅ DTOs and Mappers
- ✅ Integration Tests (Customer → Invoice → Payment flow)
- ✅ Unit Tests (Domain entities)
- ✅ E2E Tests (Complete user journey)
- ✅ Performance Tests (API latency < 200ms)

### 5. Documentation
- ✅ Product Requirements Document (PRD)
- ✅ Technical Specification
- ✅ Requirements Evaluation Report
- ✅ Code Quality Standards

## Usage Examples

### For Video Demonstration

1. **Start with dashboard view:**
   ```bash
   ./compliance-dashboard.sh
   ```

2. **Show detailed verification:**
   ```bash
   ./check-compliance.sh
   ```

3. **Run actual tests to demonstrate functionality:**
   ```bash
   # Backend integration tests
   ./mvnw test -Dtest=CustomerInvoicePaymentFlowTest
   
   # Performance tests
   ./mvnw test -Dtest=*PerformanceTest
   
   # E2E tests
   npm run test:e2e
   ```

### For Development

Run the compliance checker as part of your development workflow:

```bash
# Before committing
./check-compliance.sh && git commit -m "Your commit message"
```

### For CI/CD

Integrate into your CI/CD pipeline:

```yaml
# Example GitHub Actions
- name: Check Compliance
  run: ./check-compliance.sh
```

## Output Format

### Dashboard View (`compliance-dashboard.sh`)
- Clean, organized sections
- Color-coded status indicators (✓/✗)
- Summary at the end
- Perfect for screenshots and video

### Detailed Checker (`check-compliance.sh`)
- Comprehensive verification
- Detailed pass/fail for each requirement
- Test execution verification
- Final summary with statistics

## Requirements Coverage

These scripts verify compliance with all sections of the assessment:

1. ✅ **Introduction and Project Goal** (Section 1)
2. ✅ **Business Functionality** (Section 2)
3. ✅ **Architecture and Technical Requirements** (Section 3)
4. ✅ **Code Quality and AI Acceleration** (Section 4)

## Notes

- The scripts check for **code structure and patterns**, not runtime behavior
- For runtime verification, run the actual tests:
  - `./mvnw test` - Backend tests
  - `npm run test:e2e` - E2E tests
  - `./mvnw test -Dtest=*PerformanceTest` - Performance tests

- The scripts are **non-destructive** - they only read files and check patterns
- They work **offline** - no network connection required

## Troubleshooting

If a check fails:

1. **File/Directory not found**: Ensure you're running from the project root
2. **Pattern not found**: Verify the code structure matches expected patterns
3. **Test execution fails**: Ensure dependencies are installed and tests are configured

## Related Documentation

- [Requirements Evaluation Report](docs/requirements-evaluation-report.md) - Detailed compliance analysis
- [PRD](docs/PRD.md) - Product Requirements Document
- [Tech Spec](docs/tech-spec.md) - Technical Specification
- [Local Testing Guide](LOCAL_TESTING.md) - How to run tests locally


