# Local Testing Guide - InvoiceMe

This guide explains how to test the InvoiceMe application locally.

## Prerequisites

### Required Software

1. **Java 21 JDK**
   ```bash
   # Check if Java 21 is installed
   java -version
   
   # If not installed, install via Homebrew (macOS)
   brew install openjdk@21
   
   # Set JAVA_HOME (add to ~/.zshrc or ~/.bashrc)
   export JAVA_HOME=/usr/local/opt/openjdk@21
   ```

2. **Node.js 20.11.0+**
   ```bash
   # Check if Node.js is installed
   node -version
   
   # If not installed, use nvm (recommended)
   nvm install 20.11.0
   nvm use 20.11.0
   ```

3. **Maven** (included via `mvnw` wrapper)
   - No installation needed - use `./mvnw` instead of `mvn`

4. **PostgreSQL** (optional - for dev profile)
   ```bash
   # Install PostgreSQL (macOS)
   brew install postgresql@16
   
   # Start PostgreSQL
   brew services start postgresql@16
   
   # Create database
   createdb invoiceme_dev
   ```

### Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install Playwright browsers (for E2E tests)
npx playwright install --with-deps
```

## Quick Start

### Option 1: Use Helper Scripts (Recommended)

```bash
# Start both frontend and backend
./start-servers.sh

# The script will:
# - Start backend on http://localhost:8080
# - Start frontend on http://localhost:3000
# - Wait for both to be ready
```

### Option 2: Manual Start

#### Start Backend

```bash
# Terminal 1: Start backend
./start-backend.sh

# Or manually:
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

The backend will start on **http://localhost:8080**

#### Start Frontend

```bash
# Terminal 2: Start frontend
npm run dev
```

The frontend will start on **http://localhost:3000**

## Test User Setup

The application requires authentication. You need to create a test user first.

### Create Test User via API

```bash
# Create a test user (email: test@example.com, password: password123)
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Note:** If registration endpoint doesn't exist, you can create a user directly in the database or use the test setup from integration tests.

### Default Test Credentials

Based on the integration tests, the default test user is:
- **Email:** `test@example.com`
- **Password:** `password123`

This user is automatically created in integration tests. For local development, you may need to create it manually.

## Running Tests

### Backend Tests

```bash
# Run all backend tests
./mvnw test

# Run specific test class
./mvnw test -Dtest=InvoiceControllerTest

# Run with coverage report
./mvnw test jacoco:report
# View report: open target/site/jacoco/index.html
```

### Frontend E2E Tests

```bash
# Make sure both servers are running first
./start-servers.sh

# Run all E2E tests
npm run test:e2e

# Run tests in UI mode (interactive)
npm run test:e2e:ui

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# Run tests in debug mode
npm run test:e2e:debug

# View test report
npm run test:e2e:report
```

### API Tests (Playwright)

```bash
# Run API tests (no browser needed)
npm run test:api
```

## Manual Testing

### 1. Access the Application

1. Open browser: **http://localhost:3000**
2. You should be redirected to the login page

### 2. Login

1. Enter credentials:
   - Email: `test@example.com`
   - Password: `password123`
2. Click "Sign in"
3. You should be redirected to the customers page

### 3. Test Customer Management

1. Click "Create Customer"
2. Fill in customer details (name, email)
3. Click "Save"
4. Verify customer appears in the list

### 4. Test Invoice Management

1. Navigate to "Invoices"
2. Click "Create Invoice"
3. Select a customer
4. Add line items (description, quantity, unit price)
5. Verify balance is calculated correctly
6. Click "Send Invoice" to transition to Sent state

### 5. Test Payment Processing

1. Navigate to "Payments"
2. Click "Record Payment"
3. Select an invoice
4. Enter payment amount
5. Verify invoice balance is updated
6. Verify invoice transitions to Paid state when balance reaches zero

## Configuration

### Backend Configuration

**Development Profile** (`application-dev.yml`):
- Database: PostgreSQL (localhost:5432/invoiceme_dev)
- Port: 8080
- JPA: `ddl-auto: update` (auto-creates schema)

**Test Profile** (`application-test.yml`):
- Database: H2 in-memory
- Port: Random (for parallel tests)
- JPA: `ddl-auto: create-drop`

**Default Profile** (`application.yml`):
- Database: H2 in-memory (for quick testing)
- Port: 8080
- H2 Console: Enabled at `/h2-console`

### Frontend Configuration

**Next.js Config** (`next.config.js`):
- API Proxy: `/api/*` → `http://localhost:8080/api/*`
- React Strict Mode: Enabled

**Environment Variables** (optional):
- Create `.env.local` if needed:
  ```bash
  NEXT_PUBLIC_API_URL=http://localhost:8080/api
  ```

## Database Access

### H2 Console (Default Profile)

1. Backend must be running
2. Navigate to: **http://localhost:8080/h2-console**
3. Connection settings:
   - JDBC URL: `jdbc:h2:mem:testdb`
   - Username: `sa`
   - Password: (leave empty)
4. Click "Connect"

### PostgreSQL (Dev Profile)

```bash
# Connect via psql
psql invoiceme_dev

# Or use a GUI tool (pgAdmin, DBeaver, etc.)
# Connection: localhost:5432, database: invoiceme_dev
```

## Troubleshooting

### Backend Won't Start

**Issue:** Port 8080 already in use
```bash
# Check what's using port 8080
lsof -ti:8080

# Stop it
./stop-backend.sh

# Or kill manually
kill -9 $(lsof -ti:8080)
```

**Issue:** Java version mismatch
```bash
# Check Java version
java -version  # Should be 21

# Set JAVA_HOME
export JAVA_HOME=/usr/local/opt/openjdk@21
```

**Issue:** Database connection failed
```bash
# For PostgreSQL: Make sure PostgreSQL is running
brew services start postgresql@16

# For H2: No setup needed (in-memory)
```

### Frontend Won't Start

**Issue:** Port 3000 already in use
```bash
# Check what's using port 3000
lsof -ti:3000

# Kill it
kill -9 $(lsof -ti:3000)
```

**Issue:** Dependencies not installed
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Authentication Issues

**Issue:** Can't login
- Make sure test user exists in database
- Check backend logs for authentication errors
- Verify JWT secret is configured

**Issue:** 401 Unauthorized errors
- Check if token is being sent in request headers
- Verify token hasn't expired
- Check backend security configuration

### Tests Failing

**Issue:** E2E tests fail with "Element not found"
- Make sure both servers are running
- Check if test user exists
- Verify `data-testid` attributes are present in UI

**Issue:** Integration tests fail
- Make sure backend is running
- Check database connection
- Verify test data setup

## API Testing

### Using cURL

```bash
# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'

# Save the token from response, then use it:
TOKEN="your-jwt-token-here"

# Get customers (requires auth)
curl -X GET http://localhost:8080/api/customers \
  -H "Authorization: Bearer $TOKEN"

# Create customer
curl -X POST http://localhost:8080/api/customers \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Customer", "email": "customer@example.com"}'
```

### Using Postman/Insomnia

1. Import API collection (if available)
2. Set base URL: `http://localhost:8080/api`
3. Login first to get token
4. Set token in Authorization header: `Bearer <token>`

### API Documentation

If SpringDoc OpenAPI is enabled:
- Swagger UI: **http://localhost:8080/swagger-ui.html**
- OpenAPI JSON: **http://localhost:8080/v3/api-docs**

## Stopping Servers

```bash
# Stop backend
./stop-backend.sh

# Stop frontend
# Press Ctrl+C in the terminal running npm run dev

# Stop both (if using start-servers.sh)
# Press Ctrl+C or kill the processes
```

## Next Steps

1. **Run Tests:** Verify everything works with `./mvnw test` and `npm run test:e2e`
2. **Manual Testing:** Test the full user journey manually
3. **API Testing:** Use Postman/Insomnia to test API endpoints
4. **Debugging:** Use browser DevTools and backend logs for debugging

## Additional Resources

- **Backend Tests:** `src/test/java/com/invoiceme/`
- **Frontend E2E Tests:** `tests/e2e/`
- **Test Documentation:** `tests/README.md`
- **Tech Spec:** `docs/tech-spec.md`

---

**Last Updated:** 2025-11-09

