package com.invoiceme.performance;

import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;

/**
 * Base class for API performance tests.
 * 
 * Provides common functionality for measuring API response times:
 * - Timing utilities for performance measurement
 * - Common test setup with Spring Boot Test context
 * - Performance assertions for response time thresholds
 * 
 * All performance tests should extend this class and use the timing utilities
 * to measure and assert API response times meet performance requirements.
 */
@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
public abstract class ApiPerformanceTest {
    
    @Autowired
    protected MockMvc mockMvc;
    
    /**
     * Performance threshold for API operations (200ms as per AC #1).
     */
    protected static final long API_PERFORMANCE_THRESHOLD_MS = 200;
    
    /**
     * Performance measurement utility class.
     */
    protected static class PerformanceTimer {
        private long startTime;
        private long endTime;
        
        /**
         * Start timing measurement.
         */
        public void start() {
            startTime = System.currentTimeMillis();
        }
        
        /**
         * Stop timing measurement.
         */
        public void stop() {
            endTime = System.currentTimeMillis();
        }
        
        /**
         * Get elapsed time in milliseconds.
         * 
         * @return elapsed time in milliseconds
         */
        public long getElapsedMs() {
            if (endTime == 0) {
                throw new IllegalStateException("Timer not stopped. Call stop() before getElapsedMs()");
            }
            return endTime - startTime;
        }
        
        /**
         * Assert that elapsed time is under the specified threshold.
         * 
         * @param thresholdMs maximum allowed time in milliseconds
         * @param operation description of the operation being measured
         * @throws AssertionError if elapsed time exceeds threshold
         */
        public void assertUnderThreshold(long thresholdMs, String operation) {
            long elapsed = getElapsedMs();
            if (elapsed >= thresholdMs) {
                throw new AssertionError(
                    String.format("Performance assertion failed: %s took %d ms, expected < %d ms",
                        operation, elapsed, thresholdMs)
                );
            }
        }
        
        /**
         * Assert that elapsed time is under the default API performance threshold (200ms).
         * 
         * @param operation description of the operation being measured
         * @throws AssertionError if elapsed time exceeds threshold
         */
        public void assertUnderApiThreshold(String operation) {
            assertUnderThreshold(API_PERFORMANCE_THRESHOLD_MS, operation);
        }
    }
    
    /**
     * Create a new performance timer instance.
     * 
     * @return new PerformanceTimer instance
     */
    protected PerformanceTimer createTimer() {
        return new PerformanceTimer();
    }
    
    @BeforeEach
    void setUp() {
        // Common setup for all performance tests
        // Individual test classes can override this method for additional setup
    }
}


