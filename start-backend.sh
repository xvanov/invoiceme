#!/bin/bash
# Start script for InvoiceMe backend
# Sets JAVA_HOME to Java 21 before running Maven
# Checks if port 8080 is already in use

PORT=8080
PID=$(lsof -ti:$PORT)

if [ ! -z "$PID" ]; then
    echo "Port $PORT is already in use by process $PID"
    echo "Run ./stop-backend.sh to stop it first, or kill the process manually"
    exit 1
fi

export JAVA_HOME=/usr/local/opt/openjdk@21
./mvnw spring-boot:run

