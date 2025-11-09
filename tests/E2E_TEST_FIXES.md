# E2E Test Fixes - Authentication Issues

## Problem Summary

All E2E tests were failing because:
1. **Authentication Required**: All API endpoints are protected (except `/api/auth/**`)
2. **Tests Not Authenticated**: Tests were trying to access protected endpoints without authentication tokens
3. **Factories Not Authenticated**: Test data factories (CustomerFactory) were making API calls without auth tokens
4. **Test User Missing**: Test user (test@example.com / password123) may not exist in database

## Fixes Applied

### 1. Authentication Fixture Created
- **File**: `tests/support/fixtures/auth-fixture.ts`
- **Purpose**: Automatically logs in before each test and provides auth credentials
- **Provides**: `authCredentials` with email, password, and JWT token

### 2. Customer Factory Updated
- **File**: `tests/support/fixtures/factories/customer-factory.ts`
- **Changes**: 
  - Now accepts `authToken` parameter in constructor
  - Adds `Authorization: Bearer <token>` header to all API requests
  - Cleanup also uses auth token

### 3. Test Fixtures Updated
- **File**: `tests/support/fixtures/index.ts`
- **Changes**:
  - Added `authFixture` to automatically login before tests
  - Updated `customerFactoryFixture` to pass auth token to factory
  - Added `authenticatedPageFixture` to set token in localStorage before page navigation

### 4. Payment Flow Test Fixed
- **File**: `tests/e2e/payment-flow.spec.ts`
- **Changes**: All API requests now include auth headers

### 5. Global Setup Created
- **File**: `tests/global-setup.ts`
- **Purpose**: Ensures test user exists before tests run
- **Note**: May need manual user creation if registration endpoint doesn't exist

## Required Setup

### 1. Create Test User

The test user must exist in the database before running tests:

**Email**: `test@example.com`  
**Password**: `password123` (BCrypt hashed)

**Option A: Via Integration Test (Recommended)**
The integration tests automatically create the test user. Run:
```bash
./mvnw test -Dtest=CustomerInvoicePaymentFlowTest
```
This creates the user in the test database. For E2E tests, you may need to create it in the dev database.

**Option B: Via Database (H2 Console)**
1. Start backend: `./start-backend.sh`
2. Open H2 Console: http://localhost:8080/h2-console
3. Connect (JDBC URL: `jdbc:h2:mem:testdb`, User: `sa`, Password: empty)
4. Generate BCrypt hash for "password123" using Spring Security:
   - Use a Java utility or online BCrypt generator
   - Or use the integration test to see the hash: `./mvnw test -Dtest=CustomerInvoicePaymentFlowTest` and check logs
5. Run SQL (replace HASH with actual BCrypt hash):
```sql
INSERT INTO users (id, email, password, created_at) 
VALUES (
  gen_random_uuid(), 
  'test@example.com', 
  '<BCRYPT_HASH>',  -- Generate using Spring Security BCryptPasswordEncoder
  CURRENT_TIMESTAMP
);
```

**Option C: Via Helper Script**
```bash
./tests/create-test-user.sh
```
This script attempts to create the user via API (if registration endpoint exists).

**Option B: Via API (if registration endpoint exists)**
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
```

**Option C: Via Integration Test Setup**
The integration tests automatically create this user. You can run:
```bash
./mvnw test -Dtest=CustomerInvoicePaymentFlowTest
```
This will create the test user in the test database.

### 2. Verify Test User Exists

```bash
# Try to login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
```

Should return a JWT token if user exists.

## How It Works Now

1. **Global Setup** (`tests/global-setup.ts`):
   - Runs once before all tests
   - Attempts to login with test credentials
   - If login fails, attempts to create user (if registration endpoint exists)
   - Logs warnings if user creation fails

2. **Auth Fixture** (`tests/support/fixtures/auth-fixture.ts`):
   - Runs before each test
   - Logs in with test credentials
   - Provides `authCredentials` with token

3. **Authenticated Page Fixture** (`tests/support/fixtures/index.ts`):
   - Sets token in localStorage before page navigation
   - Ensures pages are authenticated when they load

4. **Customer Factory** (`tests/support/fixtures/factories/customer-factory.ts`):
   - Uses auth token in all API requests
   - Creates customers with authentication

## Testing the Fixes

### 1. Ensure Test User Exists
```bash
# Check if backend is running
curl http://localhost:8080/api/auth/login

# Try to login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
```

### 2. Run E2E Tests
```bash
# Make sure both servers are running
./start-servers.sh

# In another terminal, run tests
npm run test:e2e
```

### 3. Run Single Test (for debugging)
```bash
# Run specific test file
npx playwright test tests/e2e/customer-management.spec.ts

# Run in UI mode (interactive)
npx playwright test tests/e2e/customer-management.spec.ts --ui

# Run in headed mode (see browser)
npx playwright test tests/e2e/customer-management.spec.ts --headed
```

## Troubleshooting

### Issue: "Failed to login test user: 401"
**Solution**: Test user doesn't exist. Create it using one of the methods above.

### Issue: "Failed to login test user: 500"
**Solution**: Backend might not be running. Start backend: `./start-backend.sh`

### Issue: Tests still timing out
**Solution**: 
1. Check if backend is running: `curl http://localhost:8080/api/auth/login`
2. Check if frontend is running: `curl http://localhost:3000`
3. Verify test user exists (see above)
4. Check browser console for errors (run in headed mode)

### Issue: "Element not found" errors
**Solution**: 
1. Check if pages are loading correctly (run in headed mode)
2. Verify `data-testid` attributes exist in UI components
3. Check if authentication is working (token in localStorage)

## Next Steps

1. **Create Test User**: Use one of the methods above to create test user
2. **Run Tests**: `npm run test:e2e`
3. **Debug Failures**: Use `--ui` or `--headed` flags to debug
4. **Fix Remaining Issues**: Address any remaining test failures

## Files Modified

- ✅ `tests/support/fixtures/auth-fixture.ts` - Created
- ✅ `tests/support/fixtures/factories/customer-factory.ts` - Updated
- ✅ `tests/support/fixtures/index.ts` - Updated
- ✅ `tests/e2e/payment-flow.spec.ts` - Updated
- ✅ `tests/global-setup.ts` - Created
- ✅ `playwright.config.ts` - Updated (added globalSetup)

---

**Status**: Fixes applied. Tests should now authenticate properly. Create test user before running tests.

