package com.invoiceme.performance;

import com.invoiceme.api.invoices.CreateInvoiceRequest;
import com.invoiceme.application.commands.invoice.*;
import com.invoiceme.application.queries.invoice.*;
import com.invoiceme.domain.invoice.Invoice;
import com.invoiceme.infrastructure.persistence.invoice.InvoiceRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Performance tests for Invoice API endpoints.
 * 
 * Verifies that all Invoice API operations complete in under 200ms (AC #3).
 * 
 * Tests:
 * - POST /api/invoices (create invoice)
 * - GET /api/invoices/{id} (retrieve invoice)
 * - GET /api/invoices?status=SENT (list with filter)
 */
@DisplayName("Invoice API Performance Tests")
class InvoiceApiPerformanceTest extends ApiPerformanceTest {
    
    @MockBean
    private InvoiceRepository invoiceRepository;
    
    @MockBean
    private CreateInvoiceCommandHandler createInvoiceCommandHandler;
    
    @MockBean
    private GetInvoiceQueryHandler getInvoiceQueryHandler;
    
    @MockBean
    private ListInvoicesQueryHandler listInvoicesQueryHandler;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    private UUID testInvoiceId;
    private UUID testCustomerId;
    
    @BeforeEach
    @Override
    void setUp() {
        super.setUp();
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
    
    @Test
    @DisplayName("POST /api/invoices - should complete in under 200ms")
    void testCreateInvoicePerformance() throws Exception {
        // Given
        CreateInvoiceRequest request = new CreateInvoiceRequest(testCustomerId);
        Invoice savedInvoice = createInvoiceWithId(testCustomerId, testInvoiceId);
        
        when(createInvoiceCommandHandler.handle(any(CreateInvoiceCommand.class))).thenReturn(savedInvoice);
        
        PerformanceTimer timer = createTimer();
        
        // When
        timer.start();
        mockMvc.perform(post("/api/invoices")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.customerId").value(testCustomerId.toString()))
                .andExpect(jsonPath("$.status").value("DRAFT"))
                .andExpect(jsonPath("$.balance").value(0));
        timer.stop();
        
        // Then
        timer.assertUnderApiThreshold("POST /api/invoices (create invoice)");
        
        verify(createInvoiceCommandHandler, times(1)).handle(any(CreateInvoiceCommand.class));
    }
    
    @Test
    @DisplayName("GET /api/invoices/{id} - should complete in under 200ms")
    void testRetrieveInvoicePerformance() throws Exception {
        // Given
        Invoice invoice = createInvoiceWithId(testCustomerId, testInvoiceId);
        
        when(getInvoiceQueryHandler.handle(any(GetInvoiceQuery.class))).thenReturn(Optional.of(invoice));
        
        PerformanceTimer timer = createTimer();
        
        // When
        timer.start();
        mockMvc.perform(get("/api/invoices/" + testInvoiceId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(testInvoiceId.toString()))
                .andExpect(jsonPath("$.customerId").value(testCustomerId.toString()))
                .andExpect(jsonPath("$.status").value("DRAFT"));
        timer.stop();
        
        // Then
        timer.assertUnderApiThreshold("GET /api/invoices/{id} (retrieve invoice)");
        
        verify(getInvoiceQueryHandler, times(1)).handle(any(GetInvoiceQuery.class));
    }
    
    @Test
    @DisplayName("GET /api/invoices?status=SENT - should complete in under 200ms")
    void testListInvoicesWithFilterPerformance() throws Exception {
        // Given
        Invoice invoice1 = createInvoiceWithId(testCustomerId, testInvoiceId);
        invoice1.markAsSent();
        Invoice invoice2 = createInvoiceWithId(testCustomerId, UUID.randomUUID());
        invoice2.markAsSent();
        
        when(listInvoicesQueryHandler.handle(any(ListInvoicesQuery.class))).thenReturn(List.of(invoice1, invoice2));
        
        PerformanceTimer timer = createTimer();
        
        // When
        timer.start();
        mockMvc.perform(get("/api/invoices")
                .param("status", "SENT"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
        timer.stop();
        
        // Then
        timer.assertUnderApiThreshold("GET /api/invoices?status=SENT (list with filter)");
        
        verify(listInvoicesQueryHandler, times(1)).handle(any(ListInvoicesQuery.class));
    }
}

