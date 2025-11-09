# InvoiceMe - Test Framework Documentation

**Framework:** Playwright 1.41.0  
**Language:** TypeScript  
**Architecture:** Composable fixtures, data factories, network-first patterns

---

## Setup Instructions

### Prerequisites

1. **Node.js**: Install Node.js 20.11.0 or higher (see `.nvmrc`)
2. **Dependencies**: Install test dependencies
   ```bash
   npm install
   ```
3. **Environment**: Copy `.env.example` to `.env` and configure:
   ```bash
   cp .env.example .env
   # Edit .env with your environment-specific values
   ```
4. **Playwright Browsers**: Install browser binaries
   ```bash
   npx playwright install --with-deps
   ```

### Configuration

- **Config File**: `playwright.config.ts`
- **Test Directory**: `tests/e2e/`
- **Support Files**: `tests/support/`
- **Environment**: `.env` (see `.env.example` for template)

---

## Running Tests

### Basic Commands

```bash
# Run all E2E tests
npm run test:e2e

# Run tests in UI mode (interactive)
npm run test:e2e:ui

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# Run tests in debug mode
npm run test:e2e:debug

# Show test report
npm run test:e2e:report

# Generate test code (codegen)
npm run test:e2e:codegen
```

### Advanced Usage

```bash
# Run specific test file
npx playwright test tests/e2e/example.spec.ts

# Run tests matching pattern
npx playwright test --grep "login"

# Run tests in specific browser
npx playwright test --project=chromium

# Run tests with specific environment
TEST_ENV=staging npx playwright test

# Run tests with custom base URL
BASE_URL=http://localhost:3001 npx playwright test
```

---

## Architecture Overview

### Fixture Architecture

The test framework uses a **composable fixture pattern** following the pure function → fixture → mergeTests approach:

1. **Pure Functions** (`tests/support/helpers/`): Framework-agnostic, unit-testable functions
2. **Fixtures** (`tests/support/fixtures/`): Framework-specific wrappers that inject dependencies
3. **Composition** (`tests/support/fixtures/index.ts`): `mergeTests` combines multiple fixtures

**Knowledge Base Reference:** `bmad/bmm/testarch/knowledge/fixture-architecture.md`

**Example:**
```typescript
import { test, expect } from '../support/fixtures';

test('user can login', async ({ page, userFactory }) => {
  // userFactory is automatically available via fixture
  const user = await userFactory.createUser();
  // ... test logic
  // userFactory.cleanup() is called automatically after test
});
```

### Data Factories

Test data is generated using **factory functions** with sensible defaults and explicit overrides:

- **Parallel-Safe**: Uses `faker` for unique, collision-free data
- **Schema Evolution**: Defaults adapt to schema changes automatically
- **Explicit Intent**: Overrides show what matters for each test
- **Auto-Cleanup**: Factories track created entities and clean up automatically

**Knowledge Base Reference:** `bmad/bmm/testarch/knowledge/data-factories.md`

**Example:**
```typescript
// Default user
const user = await userFactory.createUser();

// Admin user (explicit override shows intent)
const admin = await userFactory.createAdminUser();

// Custom user with specific email
const customUser = await userFactory.createUser({
  email: 'test@example.com',
  name: 'Test User',
});
```

### Network-First Patterns

Tests use **network-first patterns** to prevent race conditions:

1. **Intercept Before Navigate**: Register route interception before triggering action
2. **Wait for Response**: Await actual network response, not arbitrary timeouts
3. **Deterministic Waits**: Use network signals, not hard waits

**Knowledge Base Reference:** `bmad/bmm/testarch/knowledge/network-first.md`

**Example:**
```typescript
// ✅ CORRECT: Intercept BEFORE navigate
const responsePromise = page.waitForResponse(
  (resp) => resp.url().includes('/api/users') && resp.status() === 200
);

await page.goto('/dashboard');

// Wait for actual response
const response = await responsePromise;
const data = await response.json();
```

---

## Best Practices

### Selector Strategy

**Always use `data-testid` attributes** for UI elements:

```typescript
// ✅ GOOD: data-testid selector
await page.click('[data-testid="login-button"]');
await page.fill('[data-testid="email-input"]', 'test@example.com');

// ❌ BAD: CSS selector (brittle)
await page.click('.btn-primary');
await page.fill('#email', 'test@example.com');
```

**Why?**
- `data-testid` selectors are stable and don't break when CSS changes
- They explicitly mark elements for testing
- They're easier to maintain and understand

### Test Isolation

Each test should be **isolated and independent**:

- **No Shared State**: Each test creates its own data
- **Auto-Cleanup**: Fixtures handle cleanup automatically
- **Parallel Execution**: Tests can run in parallel without conflicts

**Example:**
```typescript
test('user can create invoice', async ({ page, userFactory }) => {
  // Create isolated test data
  const user = await userFactory.createUser();
  // ... test logic
  // Cleanup happens automatically via fixture
});
```

### Test Structure

Follow **Given-When-Then** structure:

```typescript
test('user can create invoice', async ({ page, userFactory }) => {
  // GIVEN: Test data setup
  const user = await userFactory.createUser();
  const customer = await userFactory.createCustomer();

  // WHEN: User action
  await page.goto('/invoices/new');
  await page.fill('[data-testid="customer-select"]', customer.id);
  await page.click('[data-testid="create-invoice-button"]');

  // THEN: Assert expected outcome
  await expect(page.getByText('Invoice created')).toBeVisible();
});
```

### Error Handling

**Never use hard waits** (`page.waitForTimeout()`):

```typescript
// ❌ BAD: Hard wait (flaky, slow)
await page.waitForTimeout(3000);
await expect(page.getByText('Success')).toBeVisible();

// ✅ GOOD: Wait for actual signal
await expect(page.getByText('Success')).toBeVisible({ timeout: 10000 });
```

**Use network-first patterns** for deterministic waits:

```typescript
// ✅ GOOD: Wait for network response
const responsePromise = page.waitForResponse('/api/invoices');
await page.click('[data-testid="create-button"]');
await responsePromise;
```

---

## CI Integration

### GitHub Actions Example

```yaml
name: E2E Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: '.nvmrc'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: npm run test:e2e
        env:
          TEST_ENV: staging
          BASE_URL: ${{ secrets.STAGING_URL }}
      
      - name: Upload test results
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: test-results
          path: test-results/
          retention-days: 30
      
      - name: Upload Playwright report
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

### Artifact Upload

Test artifacts (screenshots, videos, traces) are automatically captured on failure:

- **Screenshots**: `test-results/` (only on failure)
- **Videos**: `test-results/` (only on failure)
- **Traces**: `test-results/` (on first retry)
- **HTML Report**: `playwright-report/` (always generated)

CI should upload these artifacts on failure for debugging.

---

## Knowledge Base References

The test framework follows patterns documented in the BMAD Test Architect knowledge base:

- **Fixture Architecture**: `bmad/bmm/testarch/knowledge/fixture-architecture.md`
  - Pure function → fixture → mergeTests pattern
  - Composable fixtures without inheritance
  - Auto-cleanup patterns

- **Data Factories**: `bmad/bmm/testarch/knowledge/data-factories.md`
  - Factory functions with overrides
  - API-first setup (fast, parallel-safe)
  - Schema evolution handling

- **Network-First**: `bmad/bmm/testarch/knowledge/network-first.md`
  - Intercept-before-navigate pattern
  - Deterministic waits based on network responses
  - HAR capture for debugging

- **Playwright Config**: `bmad/bmm/testarch/knowledge/playwright-config.md`
  - Environment-based configuration
  - Timeout standards (action 15s, navigation 30s, expect 10s, test 60s)
  - Artifact output configuration
  - Parallelization settings

- **Test Quality**: `bmad/bmm/testarch/knowledge/test-quality.md`
  - Deterministic test design
  - Test isolation with cleanup
  - Explicit assertions
  - Length/time limits

---

## Troubleshooting

### Common Issues

**Issue**: Tests fail with "Element not found"
- **Solution**: Use network-first patterns - wait for API response before asserting
- **Check**: Verify `data-testid` selectors are present in UI

**Issue**: Tests fail in CI but pass locally
- **Solution**: Check environment variables (BASE_URL, API_URL)
- **Check**: Verify CI has correct Node.js version (see `.nvmrc`)

**Issue**: Tests are flaky (random failures)
- **Solution**: Use network-first patterns instead of hard waits
- **Solution**: Ensure test isolation (no shared state)
- **Check**: Review test logs for race conditions

**Issue**: Cleanup fails (users not deleted)
- **Solution**: Check API endpoint permissions
- **Solution**: Verify cleanup logic in factory
- **Note**: Cleanup errors are logged but don't fail tests

### Debug Mode

Run tests in debug mode to step through execution:

```bash
npm run test:e2e:debug
```

This opens Playwright Inspector where you can:
- Step through test execution
- Inspect page state
- View network requests
- Debug selector issues

### Trace Viewer

View detailed test execution traces:

```bash
# After test run, view trace
npx playwright show-trace test-results/path-to-trace.zip
```

Traces include:
- Screenshots at each step
- Network requests/responses
- Console logs
- DOM snapshots

---

## Next Steps

1. **Review Sample Tests**: Check `tests/e2e/example.spec.ts` for patterns
2. **Create Your Tests**: Add tests in `tests/e2e/` following the patterns
3. **Extend Factories**: Add more factories (InvoiceFactory, PaymentFactory) as needed
4. **Add Helpers**: Create additional helpers in `tests/support/helpers/`
5. **Set Up CI**: Configure CI/CD pipeline to run tests automatically

---

## Support

For questions or issues:
- Review knowledge base references above
- Check Playwright documentation: https://playwright.dev
- Review test examples in `tests/e2e/`

---

**Framework Version:** Playwright 1.41.0  
**Last Updated:** 2025-11-09  
**Maintained by:** BMAD Test Architect


