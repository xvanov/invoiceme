package com.invoiceme.domain.invoice;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

import java.math.BigDecimal;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Invoice Domain Entity Tests")
class InvoiceTest {
    
    @Test
    @DisplayName("Should create invoice in Draft state with zero balance")
    void createInvoice_ShouldBeInDraftStateWithZeroBalance() {
        // Given
        UUID customerId = UUID.randomUUID();
        
        // When
        Invoice invoice = new Invoice(customerId);
        
        // Then
        assertEquals(InvoiceStatus.DRAFT, invoice.getStatus());
        assertEquals(BigDecimal.ZERO, invoice.getBalance());
        assertEquals(customerId, invoice.getCustomerId());
        assertTrue(invoice.getLineItems().isEmpty());
    }
    
    @Test
    @DisplayName("Should throw exception when creating invoice with null customer ID")
    void createInvoice_WithNullCustomerId_ShouldThrowException() {
        // When/Then
        assertThrows(IllegalArgumentException.class, () -> new Invoice(null));
    }
    
    @Test
    @DisplayName("Should add line item and recalculate balance correctly")
    void addLineItem_ShouldRecalculateBalance() {
        // Given
        UUID customerId = UUID.randomUUID();
        Invoice invoice = new Invoice(customerId);
        InvoiceLineItem lineItem = new InvoiceLineItem("Service", 2, new BigDecimal("100.00"));
        
        // When
        invoice.addLineItem(lineItem);
        
        // Then
        assertEquals(1, invoice.getLineItems().size());
        assertEquals(new BigDecimal("200.00"), invoice.getBalance());
    }
    
    @Test
    @DisplayName("Should add multiple line items and calculate total balance")
    void addMultipleLineItems_ShouldCalculateTotalBalance() {
        // Given
        UUID customerId = UUID.randomUUID();
        Invoice invoice = new Invoice(customerId);
        InvoiceLineItem item1 = new InvoiceLineItem("Service 1", 2, new BigDecimal("100.00"));
        InvoiceLineItem item2 = new InvoiceLineItem("Service 2", 3, new BigDecimal("50.00"));
        
        // When
        invoice.addLineItem(item1);
        invoice.addLineItem(item2);
        
        // Then
        assertEquals(2, invoice.getLineItems().size());
        assertEquals(new BigDecimal("350.00"), invoice.getBalance()); // 200 + 150
    }
    
    @Test
    @DisplayName("Should not allow adding line items to Sent invoice")
    void addLineItem_ToSentInvoice_ShouldThrowException() {
        // Given
        UUID customerId = UUID.randomUUID();
        Invoice invoice = new Invoice(customerId);
        invoice.markAsSent();
        InvoiceLineItem lineItem = new InvoiceLineItem("Service", 1, new BigDecimal("100.00"));
        
        // When/Then
        IllegalStateException exception = assertThrows(IllegalStateException.class, 
                () -> invoice.addLineItem(lineItem));
        assertTrue(exception.getMessage().contains("Cannot add line items to invoice in SENT state"));
    }
    
    @Test
    @DisplayName("Should not allow adding line items to Paid invoice")
    void addLineItem_ToPaidInvoice_ShouldThrowException() {
        // Given
        UUID customerId = UUID.randomUUID();
        Invoice invoice = new Invoice(customerId);
        InvoiceLineItem lineItem = new InvoiceLineItem("Service", 2, new BigDecimal("100.00"));
        invoice.addLineItem(lineItem);
        invoice.markAsSent();
        invoice.applyPayment(new BigDecimal("200.00")); // Pay full balance
        InvoiceLineItem newLineItem = new InvoiceLineItem("Another Service", 1, new BigDecimal("100.00"));
        
        // When/Then
        IllegalStateException exception = assertThrows(IllegalStateException.class, 
                () -> invoice.addLineItem(newLineItem));
        assertTrue(exception.getMessage().contains("Cannot add line items to invoice in PAID state"));
    }
    
    @Test
    @DisplayName("Should transition from Draft to Sent")
    void markAsSent_FromDraft_ShouldTransitionToSent() {
        // Given
        UUID customerId = UUID.randomUUID();
        Invoice invoice = new Invoice(customerId);
        
        // When
        invoice.markAsSent();
        
        // Then
        assertEquals(InvoiceStatus.SENT, invoice.getStatus());
    }
    
    @Test
    @DisplayName("Should not allow marking Sent invoice as Sent again")
    void markAsSent_FromSent_ShouldThrowException() {
        // Given
        UUID customerId = UUID.randomUUID();
        Invoice invoice = new Invoice(customerId);
        invoice.markAsSent();
        
        // When/Then
        IllegalStateException exception = assertThrows(IllegalStateException.class, 
                () -> invoice.markAsSent());
        assertTrue(exception.getMessage().contains("Cannot mark invoice as Sent from SENT state"));
    }
    
    @Test
    @DisplayName("Should not allow updating invoice in Sent state")
    void updateCustomerId_FromSent_ShouldThrowException() {
        // Given
        UUID customerId = UUID.randomUUID();
        UUID newCustomerId = UUID.randomUUID();
        Invoice invoice = new Invoice(customerId);
        invoice.markAsSent();
        
        // When/Then
        IllegalStateException exception = assertThrows(IllegalStateException.class, 
                () -> invoice.updateCustomerId(newCustomerId));
        assertTrue(exception.getMessage().contains("Cannot update invoice in SENT state"));
    }
    
    @Test
    @DisplayName("Should apply payment and reduce balance")
    void applyPayment_ShouldReduceBalance() {
        // Given
        UUID customerId = UUID.randomUUID();
        Invoice invoice = new Invoice(customerId);
        InvoiceLineItem lineItem = new InvoiceLineItem("Service", 2, new BigDecimal("100.00"));
        invoice.addLineItem(lineItem);
        invoice.markAsSent();
        BigDecimal paymentAmount = new BigDecimal("150.00");
        
        // When
        invoice.applyPayment(paymentAmount);
        
        // Then
        assertEquals(new BigDecimal("50.00"), invoice.getBalance());
        assertEquals(InvoiceStatus.SENT, invoice.getStatus()); // Still SENT, balance not zero
    }
    
    @Test
    @DisplayName("Should transition to Paid when payment equals balance")
    void applyPayment_EqualToBalance_ShouldTransitionToPaid() {
        // Given
        UUID customerId = UUID.randomUUID();
        Invoice invoice = new Invoice(customerId);
        InvoiceLineItem lineItem = new InvoiceLineItem("Service", 2, new BigDecimal("100.00"));
        invoice.addLineItem(lineItem);
        invoice.markAsSent();
        BigDecimal paymentAmount = new BigDecimal("200.00");
        
        // When
        invoice.applyPayment(paymentAmount);
        
        // Then
        assertEquals(0, invoice.getBalance().compareTo(BigDecimal.ZERO));
        assertEquals(InvoiceStatus.PAID, invoice.getStatus());
    }
    
    @Test
    @DisplayName("Should not allow applying payment to Draft invoice")
    void applyPayment_ToDraftInvoice_ShouldThrowException() {
        // Given
        UUID customerId = UUID.randomUUID();
        Invoice invoice = new Invoice(customerId);
        BigDecimal paymentAmount = new BigDecimal("100.00");
        
        // When/Then
        IllegalStateException exception = assertThrows(IllegalStateException.class, 
                () -> invoice.applyPayment(paymentAmount));
        assertTrue(exception.getMessage().contains("Cannot apply payment to invoice in DRAFT state"));
    }
    
    @Test
    @DisplayName("Should not allow payment amount exceeding balance")
    void applyPayment_ExceedingBalance_ShouldThrowException() {
        // Given
        UUID customerId = UUID.randomUUID();
        Invoice invoice = new Invoice(customerId);
        InvoiceLineItem lineItem = new InvoiceLineItem("Service", 2, new BigDecimal("100.00"));
        invoice.addLineItem(lineItem);
        invoice.markAsSent();
        BigDecimal paymentAmount = new BigDecimal("300.00");
        
        // When/Then
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, 
                () -> invoice.applyPayment(paymentAmount));
        assertTrue(exception.getMessage().contains("Payment amount cannot exceed invoice balance"));
    }
    
    @Test
    @DisplayName("Should not allow zero or negative payment amount")
    void applyPayment_ZeroOrNegativeAmount_ShouldThrowException() {
        // Given
        UUID customerId = UUID.randomUUID();
        Invoice invoice = new Invoice(customerId);
        invoice.markAsSent();
        
        // When/Then
        assertThrows(IllegalArgumentException.class, 
                () -> invoice.applyPayment(BigDecimal.ZERO));
        assertThrows(IllegalArgumentException.class, 
                () -> invoice.applyPayment(new BigDecimal("-10.00")));
    }
    
    @Test
    @DisplayName("Should update customer ID in Draft state")
    void updateCustomerId_InDraftState_ShouldUpdate() {
        // Given
        UUID customerId = UUID.randomUUID();
        UUID newCustomerId = UUID.randomUUID();
        Invoice invoice = new Invoice(customerId);
        
        // When
        invoice.updateCustomerId(newCustomerId);
        
        // Then
        assertEquals(newCustomerId, invoice.getCustomerId());
    }
    
    @Test
    @DisplayName("Should not allow null customer ID when updating")
    void updateCustomerId_WithNull_ShouldThrowException() {
        // Given
        UUID customerId = UUID.randomUUID();
        Invoice invoice = new Invoice(customerId);
        
        // When/Then
        assertThrows(IllegalArgumentException.class, 
                () -> invoice.updateCustomerId(null));
    }
}

