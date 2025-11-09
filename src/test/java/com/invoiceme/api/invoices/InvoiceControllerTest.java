package com.invoiceme.api.invoices;

import com.invoiceme.application.commands.invoice.*;
import com.invoiceme.application.queries.invoice.*;
import com.invoiceme.domain.invoice.Invoice;
import com.invoiceme.domain.invoice.InvoiceLineItem;
import com.invoiceme.domain.invoice.InvoiceStatus;
import com.invoiceme.infrastructure.persistence.invoice.InvoiceRepository;
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
@DisplayName("Invoice API Integration Tests")
class InvoiceControllerTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @MockBean
    private InvoiceRepository invoiceRepository;
    
    @MockBean
    private CreateInvoiceCommandHandler createInvoiceCommandHandler;
    
    @MockBean
    private AddLineItemCommandHandler addLineItemCommandHandler;
    
    @MockBean
    private UpdateInvoiceCommandHandler updateInvoiceCommandHandler;
    
    @MockBean
    private SendInvoiceCommandHandler sendInvoiceCommandHandler;
    
    @MockBean
    private GetInvoiceQueryHandler getInvoiceQueryHandler;
    
    @MockBean
    private ListInvoicesQueryHandler listInvoicesQueryHandler;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    private UUID testInvoiceId;
    private UUID testCustomerId;
    
    @BeforeEach
    void setUp() {
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
    @DisplayName("POST /api/invoices - should create invoice in Draft state")
    void shouldCreateInvoiceInDraftState() throws Exception {
        // Given
        CreateInvoiceRequest request = new CreateInvoiceRequest(testCustomerId);
        Invoice savedInvoice = createInvoiceWithId(testCustomerId, testInvoiceId);
        
        when(createInvoiceCommandHandler.handle(any(CreateInvoiceCommand.class))).thenReturn(savedInvoice);
        
        // When & Then
        mockMvc.perform(post("/api/invoices")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.customerId").value(testCustomerId.toString()))
                .andExpect(jsonPath("$.status").value("DRAFT"))
                .andExpect(jsonPath("$.balance").value(0));
        
        verify(createInvoiceCommandHandler, times(1)).handle(any(CreateInvoiceCommand.class));
    }
    
    @Test
    @DisplayName("GET /api/invoices/{id} - should retrieve invoice by ID")
    void shouldRetrieveInvoiceById() throws Exception {
        // Given
        Invoice invoice = createInvoiceWithId(testCustomerId, testInvoiceId);
        
        when(getInvoiceQueryHandler.handle(any(GetInvoiceQuery.class))).thenReturn(Optional.of(invoice));
        
        // When & Then
        mockMvc.perform(get("/api/invoices/" + testInvoiceId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(testInvoiceId.toString()))
                .andExpect(jsonPath("$.customerId").value(testCustomerId.toString()))
                .andExpect(jsonPath("$.status").value("DRAFT"));
        
        verify(getInvoiceQueryHandler, times(1)).handle(any(GetInvoiceQuery.class));
    }
    
    @Test
    @DisplayName("POST /api/invoices/{id}/items - should add line item and recalculate balance")
    void shouldAddLineItemAndRecalculateBalance() throws Exception {
        // Given
        Invoice invoice = createInvoiceWithId(testCustomerId, testInvoiceId);
        InvoiceLineItem lineItem = new InvoiceLineItem("Service", 2, new BigDecimal("100.00"));
        invoice.addLineItem(lineItem);
        AddLineItemRequest request = new AddLineItemRequest("Service", 2, new BigDecimal("100.00"));
        
        when(addLineItemCommandHandler.handle(any(AddLineItemCommand.class))).thenReturn(invoice);
        
        // When & Then
        mockMvc.perform(post("/api/invoices/" + testInvoiceId + "/items")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.balance").value(200.00));
        
        verify(addLineItemCommandHandler, times(1)).handle(any(AddLineItemCommand.class));
    }
    
    @Test
    @DisplayName("PUT /api/invoices/{id} - should update invoice in Draft state")
    void shouldUpdateInvoiceInDraftState() throws Exception {
        // Given
        UUID newCustomerId = UUID.randomUUID();
        Invoice invoice = createInvoiceWithId(testCustomerId, testInvoiceId);
        invoice.updateCustomerId(newCustomerId);
        CreateInvoiceRequest request = new CreateInvoiceRequest(newCustomerId);
        
        when(updateInvoiceCommandHandler.handle(any(UpdateInvoiceCommand.class))).thenReturn(invoice);
        
        // When & Then
        mockMvc.perform(put("/api/invoices/" + testInvoiceId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
        
        verify(updateInvoiceCommandHandler, times(1)).handle(any(UpdateInvoiceCommand.class));
    }
    
    @Test
    @DisplayName("POST /api/invoices/{id}/send - should mark invoice as Sent")
    void shouldMarkInvoiceAsSent() throws Exception {
        // Given
        Invoice invoice = createInvoiceWithId(testCustomerId, testInvoiceId);
        invoice.markAsSent();
        
        when(sendInvoiceCommandHandler.handle(any(SendInvoiceCommand.class))).thenReturn(invoice);
        
        // When & Then
        mockMvc.perform(post("/api/invoices/" + testInvoiceId + "/send"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SENT"));
        
        verify(sendInvoiceCommandHandler, times(1)).handle(any(SendInvoiceCommand.class));
    }
    
    @Test
    @DisplayName("GET /api/invoices - should list invoices with status filter")
    void shouldListInvoicesWithStatusFilter() throws Exception {
        // Given
        Invoice invoice1 = createInvoiceWithId(testCustomerId, testInvoiceId);
        Invoice invoice2 = createInvoiceWithId(testCustomerId, UUID.randomUUID());
        
        when(listInvoicesQueryHandler.handle(any(ListInvoicesQuery.class))).thenReturn(List.of(invoice1, invoice2));
        
        // When & Then
        mockMvc.perform(get("/api/invoices")
                .param("status", "DRAFT"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
        
        verify(listInvoicesQueryHandler, times(1)).handle(any(ListInvoicesQuery.class));
    }
    
    @Test
    @DisplayName("GET /api/invoices - should list invoices with customer filter")
    void shouldListInvoicesWithCustomerFilter() throws Exception {
        // Given
        Invoice invoice = createInvoiceWithId(testCustomerId, testInvoiceId);
        
        when(listInvoicesQueryHandler.handle(any(ListInvoicesQuery.class))).thenReturn(List.of(invoice));
        
        // When & Then
        mockMvc.perform(get("/api/invoices")
                .param("customerId", testCustomerId.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
        
        verify(listInvoicesQueryHandler, times(1)).handle(any(ListInvoicesQuery.class));
    }
    
    @Test
    @DisplayName("PUT /api/invoices/{id} - should reject update for Sent invoice")
    void shouldRejectUpdateForSentInvoice() throws Exception {
        // Given
        Invoice invoice = createInvoiceWithId(testCustomerId, testInvoiceId);
        invoice.markAsSent();
        CreateInvoiceRequest request = new CreateInvoiceRequest(testCustomerId);
        
        when(updateInvoiceCommandHandler.handle(any(UpdateInvoiceCommand.class)))
                .thenThrow(new IllegalStateException("Cannot update invoice in SENT state"));
        
        // When & Then
        mockMvc.perform(put("/api/invoices/" + testInvoiceId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
        
        verify(updateInvoiceCommandHandler, times(1)).handle(any(UpdateInvoiceCommand.class));
    }
}

