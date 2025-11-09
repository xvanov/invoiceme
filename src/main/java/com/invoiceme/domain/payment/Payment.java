package com.invoiceme.domain.payment;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Domain entity representing a Payment.
 * Applies to an invoice and updates the invoice balance.
 */
@Entity
@Table(name = "payments")
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(name = "invoice_id", nullable = false)
    private UUID invoiceId;
    
    @Column(name = "amount", nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;
    
    @Column(name = "payment_date", nullable = false)
    private LocalDateTime paymentDate;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    // Default constructor for JPA
    protected Payment() {}
    
    // Constructor for creating new payments
    public Payment(UUID invoiceId, BigDecimal amount, LocalDateTime paymentDate) {
        if (invoiceId == null) {
            throw new IllegalArgumentException("Invoice ID cannot be null");
        }
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Payment amount must be greater than zero");
        }
        if (paymentDate == null) {
            throw new IllegalArgumentException("Payment date cannot be null");
        }
        this.invoiceId = invoiceId;
        this.amount = amount;
        this.paymentDate = paymentDate;
        this.createdAt = LocalDateTime.now();
    }
    
    // Getters
    public UUID getId() {
        return id;
    }
    
    public UUID getInvoiceId() {
        return invoiceId;
    }
    
    public BigDecimal getAmount() {
        return amount;
    }
    
    public LocalDateTime getPaymentDate() {
        return paymentDate;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }
}

