#!/bin/bash
# Test script for InvoiceMe backend
# Sets JAVA_HOME to Java 21 before running Maven tests

export JAVA_HOME=/usr/local/opt/openjdk@21
./mvnw test "$@"

