package com.invoiceme.api.invoices;

import com.invoiceme.domain.invoice.InvoiceStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class InvoiceDto {
    private UUID id;
    private UUID customerId;
    private InvoiceStatus status;
    private List<InvoiceLineItemDto> lineItems;
    private BigDecimal balance;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Default constructor
    public InvoiceDto() {}
    
    // Constructor with all fields
    public InvoiceDto(UUID id, UUID customerId, InvoiceStatus status, List<InvoiceLineItemDto> lineItems, 
                     BigDecimal balance, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.customerId = customerId;
        this.status = status;
        this.lineItems = lineItems;
        this.balance = balance;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    
    // Getters and setters
    public UUID getId() {
        return id;
    }
    
    public void setId(UUID id) {
        this.id = id;
    }
    
    public UUID getCustomerId() {
        return customerId;
    }
    
    public void setCustomerId(UUID customerId) {
        this.customerId = customerId;
    }
    
    public InvoiceStatus getStatus() {
        return status;
    }
    
    public void setStatus(InvoiceStatus status) {
        this.status = status;
    }
    
    public List<InvoiceLineItemDto> getLineItems() {
        return lineItems;
    }
    
    public void setLineItems(List<InvoiceLineItemDto> lineItems) {
        this.lineItems = lineItems;
    }
    
    public BigDecimal getBalance() {
        return balance;
    }
    
    public void setBalance(BigDecimal balance) {
        this.balance = balance;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}

