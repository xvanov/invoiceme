package com.invoiceme.performance;

import com.invoiceme.application.commands.payment.RecordPaymentCommandHandler;
import com.invoiceme.domain.invoice.Invoice;
import com.invoiceme.domain.invoice.InvoiceLineItem;
import com.invoiceme.domain.payment.Payment;
import com.invoiceme.infrastructure.persistence.invoice.InvoiceRepository;
import com.invoiceme.infrastructure.persistence.payment.PaymentRepository;
import com.invoiceme.api.payments.RecordPaymentRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Performance tests for Payment API endpoints.
 * 
 * Verifies that Payment API operations complete in under 200ms (AC #4).
 * 
 * Tests:
 * - POST /api/payments (record payment)
 */
@DisplayName("Payment API Performance Tests")
class PaymentApiPerformanceTest extends ApiPerformanceTest {
    
    @MockBean
    private PaymentRepository paymentRepository;
    
    @MockBean
    private InvoiceRepository invoiceRepository;
    
    @MockBean
    private RecordPaymentCommandHandler recordPaymentCommandHandler;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    private UUID testPaymentId;
    private UUID testInvoiceId;
    private UUID testCustomerId;
    
    @BeforeEach
    @Override
    void setUp() {
        super.setUp();
        testPaymentId = UUID.randomUUID();
        testInvoiceId = UUID.randomUUID();
        testCustomerId = UUID.randomUUID();
    }
    
    private Invoice createInvoiceWithId(UUID customerId, UUID invoiceId) {
        Invoice invoice = new Invoice(customerId);
        try {
            java.lang.reflect.Field idField = Invoice.class.getDeclaredField("id");
            idField.setAccessible(true);
            idField.set(invoice, invoiceId);
        } catch (Exception e) {
            throw new RuntimeException("Failed to set invoice ID for testing", e);
        }
        return invoice;
    }
    
    private Payment createPaymentWithId(UUID invoiceId, BigDecimal amount, UUID paymentId) {
        Payment payment = new Payment(invoiceId, amount, LocalDateTime.now());
        try {
            java.lang.reflect.Field idField = Payment.class.getDeclaredField("id");
            idField.setAccessible(true);
            idField.set(payment, paymentId);
        } catch (Exception e) {
            throw new RuntimeException("Failed to set payment ID for testing", e);
        }
        return payment;
    }
    
    @Test
    @DisplayName("POST /api/payments - should complete in under 200ms")
    void testRecordPaymentPerformance() throws Exception {
        // Given
        Invoice invoice = createInvoiceWithId(testCustomerId, testInvoiceId);
        InvoiceLineItem lineItem = new InvoiceLineItem("Service", 2, new BigDecimal("100.00"));
        invoice.addLineItem(lineItem);
        invoice.markAsSent();
        invoice.applyPayment(new BigDecimal("200.00"));
        
        RecordPaymentRequest request = new RecordPaymentRequest(
                testInvoiceId,
                new BigDecimal("200.00"),
                LocalDateTime.now()
        );
        Payment savedPayment = createPaymentWithId(testInvoiceId, new BigDecimal("200.00"), testPaymentId);
        
        when(recordPaymentCommandHandler.handle(any())).thenReturn(savedPayment);
        
        PerformanceTimer timer = createTimer();
        
        // When
        timer.start();
        mockMvc.perform(post("/api/payments")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.invoiceId").value(testInvoiceId.toString()))
                .andExpect(jsonPath("$.amount").value(200.00));
        timer.stop();
        
        // Then
        timer.assertUnderApiThreshold("POST /api/payments (record payment)");
        
        verify(recordPaymentCommandHandler, times(1)).handle(any());
    }
}

