#!/bin/bash
# Create Test User for E2E Tests
# This script creates the test user required for E2E tests

API_URL="${API_URL:-http://localhost:8080/api}"
EMAIL="test@example.com"
PASSWORD="password123"

echo "Creating test user for E2E tests..."
echo "Email: $EMAIL"
echo "Password: $PASSWORD"
echo ""

# Check if backend is running
if ! curl -s "$API_URL/auth/login" > /dev/null 2>&1; then
    echo "❌ Error: Backend is not running on $API_URL"
    echo "Please start the backend first: ./start-backend.sh"
    exit 1
fi

# Try to login first (user might already exist)
echo "Checking if test user exists..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$EMAIL\", \"password\": \"$PASSWORD\"}")

if echo "$LOGIN_RESPONSE" | grep -q "token"; then
    echo "✅ Test user already exists and can login"
    exit 0
fi

# Try to create user via registration endpoint (if it exists)
echo "Attempting to create test user..."
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$EMAIL\", \"password\": \"$PASSWORD\"}")

if echo "$REGISTER_RESPONSE" | grep -q "token\|id\|email"; then
    echo "✅ Test user created successfully"
    exit 0
fi

# If registration endpoint doesn't exist, provide instructions
echo "⚠️  Registration endpoint not available or failed"
echo ""
echo "Please create the test user manually:"
echo ""
echo "Option 1: Via H2 Console (if using default profile)"
echo "  1. Start backend: ./start-backend.sh"
echo "  2. Open H2 Console: http://localhost:8080/h2-console"
echo "  3. Connect (JDBC URL: jdbc:h2:mem:testdb, User: sa, Password: empty)"
echo "  4. Run the SQL from tests/create-test-user.sql"
echo ""
echo "Option 2: Via Integration Test"
echo "  Run: ./mvnw test -Dtest=CustomerInvoicePaymentFlowTest"
echo "  This will create the test user in the test database"
echo ""
echo "Option 3: Via Database Directly"
echo "  Connect to your database and insert the user with BCrypt hashed password"
echo ""
echo "Test User Credentials:"
echo "  Email: $EMAIL"
echo "  Password: $PASSWORD"
echo ""

exit 1

