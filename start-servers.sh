#!/bin/bash
# Start both frontend and backend for E2E tests
# This script ensures both servers are running before tests

echo "Starting InvoiceMe servers for E2E tests..."

# Check if backend is running
if ! lsof -ti:8080 > /dev/null 2>&1; then
    echo "Starting backend on port 8080..."
    ./start-backend.sh &
    BACKEND_PID=$!
    echo "Backend started with PID: $BACKEND_PID"
    
    # Wait for backend to be ready
    echo "Waiting for backend to be ready..."
    for i in {1..30}; do
        if curl -s http://localhost:8080/api/customers > /dev/null 2>&1; then
            echo "Backend is ready!"
            break
        fi
        sleep 1
    done
else
    echo "Backend already running on port 8080"
fi

# Check if frontend is running
if ! lsof -ti:3000 > /dev/null 2>&1; then
    echo "Starting frontend on port 3000..."
    npm run dev &
    FRONTEND_PID=$!
    echo "Frontend started with PID: $FRONTEND_PID"
    
    # Wait for frontend to be ready
    echo "Waiting for frontend to be ready..."
    for i in {1..30}; do
        if curl -s http://localhost:3000 > /dev/null 2>&1; then
            echo "Frontend is ready!"
            break
        fi
        sleep 1
    done
else
    echo "Frontend already running on port 3000"
fi

echo ""
echo "Both servers are running!"
echo "Backend: http://localhost:8080"
echo "Frontend: http://localhost:3000"
echo ""
echo "You can now run: npm run test:e2e"
echo ""
echo "To stop servers, run: ./stop-servers.sh"

