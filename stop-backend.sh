#!/bin/bash
# Stop script for InvoiceMe backend
# Kills any process using port 8080

PORT=8080
PID=$(lsof -ti:$PORT)

if [ -z "$PID" ]; then
    echo "No process found on port $PORT"
else
    echo "Stopping process $PID on port $PORT..."
    kill -9 $PID
    sleep 1
    if lsof -ti:$PORT > /dev/null 2>&1; then
        echo "Failed to stop process"
        exit 1
    else
        echo "Port $PORT is now free"
    fi
fi

