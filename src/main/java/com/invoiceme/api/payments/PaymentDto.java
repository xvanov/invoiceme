package com.invoiceme.api.payments;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public class PaymentDto {
    private UUID id;
    private UUID invoiceId;
    private BigDecimal amount;
    private LocalDateTime paymentDate;
    private LocalDateTime createdAt;
    
    // Default constructor
    public PaymentDto() {}
    
    // Constructor with all fields
    public PaymentDto(UUID id, UUID invoiceId, BigDecimal amount, LocalDateTime paymentDate, LocalDateTime createdAt) {
        this.id = id;
        this.invoiceId = invoiceId;
        this.amount = amount;
        this.paymentDate = paymentDate;
        this.createdAt = createdAt;
    }
    
    // Getters and setters
    public UUID getId() {
        return id;
    }
    
    public void setId(UUID id) {
        this.id = id;
    }
    
    public UUID getInvoiceId() {
        return invoiceId;
    }
    
    public void setInvoiceId(UUID invoiceId) {
        this.invoiceId = invoiceId;
    }
    
    public BigDecimal getAmount() {
        return amount;
    }
    
    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
    
    public LocalDateTime getPaymentDate() {
        return paymentDate;
    }
    
    public void setPaymentDate(LocalDateTime paymentDate) {
        this.paymentDate = paymentDate;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

