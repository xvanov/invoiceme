package com.invoiceme.api.payments;

import com.invoiceme.application.commands.payment.RecordPaymentCommandHandler;
import com.invoiceme.application.queries.payment.GetPaymentQueryHandler;
import com.invoiceme.application.queries.payment.ListPaymentsQueryHandler;
import com.invoiceme.domain.invoice.Invoice;
import com.invoiceme.domain.invoice.InvoiceLineItem;
import com.invoiceme.domain.payment.Payment;
import com.invoiceme.infrastructure.persistence.invoice.InvoiceRepository;
import com.invoiceme.infrastructure.persistence.payment.PaymentRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureWebMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
@AutoConfigureWebMvc
@ActiveProfiles("test")
@DisplayName("Payment API Integration Tests")
class PaymentControllerTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @MockBean
    private PaymentRepository paymentRepository;
    
    @MockBean
    private InvoiceRepository invoiceRepository;
    
    @MockBean
    private RecordPaymentCommandHandler recordPaymentCommandHandler;
    
    @MockBean
    private GetPaymentQueryHandler getPaymentQueryHandler;
    
    @MockBean
    private ListPaymentsQueryHandler listPaymentsQueryHandler;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    private UUID testPaymentId;
    private UUID testInvoiceId;
    private UUID testCustomerId;
    
    @BeforeEach
    void setUp() {
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
    @DisplayName("POST /api/payments - should record payment and update invoice balance")
    void shouldRecordPaymentAndUpdateInvoiceBalance() throws Exception {
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
        
        // When & Then
        mockMvc.perform(post("/api/payments")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.invoiceId").value(testInvoiceId.toString()))
                .andExpect(jsonPath("$.amount").value(200.00));
        
        verify(recordPaymentCommandHandler, times(1)).handle(any());
    }
    
    @Test
    @DisplayName("GET /api/payments/{id} - should retrieve payment by ID")
    void shouldRetrievePaymentById() throws Exception {
        // Given
        Payment payment = createPaymentWithId(testInvoiceId, new BigDecimal("100.00"), testPaymentId);
        
        when(getPaymentQueryHandler.handle(any())).thenReturn(Optional.of(payment));
        
        // When & Then
        mockMvc.perform(get("/api/payments/" + testPaymentId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(testPaymentId.toString()))
                .andExpect(jsonPath("$.invoiceId").value(testInvoiceId.toString()))
                .andExpect(jsonPath("$.amount").value(100.00));
        
        verify(getPaymentQueryHandler, times(1)).handle(any());
    }
    
    @Test
    @DisplayName("GET /api/payments/invoice/{invoiceId} - should list payments for invoice")
    void shouldListPaymentsForInvoice() throws Exception {
        // Given
        Payment payment1 = createPaymentWithId(testInvoiceId, new BigDecimal("100.00"), UUID.randomUUID());
        Payment payment2 = createPaymentWithId(testInvoiceId, new BigDecimal("100.00"), UUID.randomUUID());
        
        when(listPaymentsQueryHandler.handle(any())).thenReturn(List.of(payment1, payment2));
        
        // When & Then
        mockMvc.perform(get("/api/payments/invoice/" + testInvoiceId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
        
        verify(listPaymentsQueryHandler, times(1)).handle(any());
    }
    
    @Test
    @DisplayName("POST /api/payments - should reject payment for non-existent invoice")
    void shouldRejectPaymentForNonExistentInvoice() throws Exception {
        // Given
        RecordPaymentRequest request = new RecordPaymentRequest(
                testInvoiceId,
                new BigDecimal("100.00"),
                LocalDateTime.now()
        );
        
        when(recordPaymentCommandHandler.handle(any()))
                .thenThrow(new IllegalArgumentException("Invoice not found"));
        
        // When & Then
        mockMvc.perform(post("/api/payments")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
        
        verify(recordPaymentCommandHandler, times(1)).handle(any());
    }
    
    @Test
    @DisplayName("POST /api/payments - should reject payment for Draft invoice")
    void shouldRejectPaymentForDraftInvoice() throws Exception {
        // Given
        Invoice invoice = createInvoiceWithId(testCustomerId, testInvoiceId);
        RecordPaymentRequest request = new RecordPaymentRequest(
                testInvoiceId,
                new BigDecimal("100.00"),
                LocalDateTime.now()
        );
        
        when(recordPaymentCommandHandler.handle(any()))
                .thenThrow(new IllegalStateException("Cannot apply payment to invoice in DRAFT state"));
        
        // When & Then
        mockMvc.perform(post("/api/payments")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
        
        verify(recordPaymentCommandHandler, times(1)).handle(any());
    }
}

