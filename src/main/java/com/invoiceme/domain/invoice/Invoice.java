package com.invoiceme.domain.invoice;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

/**
 * Domain entity representing an Invoice.
 * Manages its own lifecycle (Draft → Sent → Paid) and calculates balance from line items.
 * Enforces business rules: invoices can only be updated in Draft state.
 */
@Entity
@Table(name = "invoices")
public class Invoice {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(name = "customer_id", nullable = false)
    private UUID customerId;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private InvoiceStatus status;
    
    @ElementCollection
    @CollectionTable(name = "invoice_line_items", joinColumns = @JoinColumn(name = "invoice_id"))
    private List<InvoiceLineItem> lineItems;
    
    @Column(name = "balance", nullable = false, precision = 19, scale = 2)
    private BigDecimal balance;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Default constructor for JPA
    protected Invoice() {
        this.lineItems = new ArrayList<>();
        this.balance = BigDecimal.ZERO;
    }
    
    // Constructor for creating new invoices (always in Draft state)
    public Invoice(UUID customerId) {
        if (customerId == null) {
            throw new IllegalArgumentException("Customer ID cannot be null");
        }
        this.customerId = customerId;
        this.status = InvoiceStatus.DRAFT;
        this.lineItems = new ArrayList<>();
        this.balance = BigDecimal.ZERO;
        this.createdAt = LocalDateTime.now();
    }
    
    // Getters
    public UUID getId() {
        return id;
    }
    
    public UUID getCustomerId() {
        return customerId;
    }
    
    public InvoiceStatus getStatus() {
        return status;
    }
    
    public List<InvoiceLineItem> getLineItems() {
        return Collections.unmodifiableList(lineItems);
    }
    
    public BigDecimal getBalance() {
        return balance;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    /**
     * Adds a line item to the invoice.
     * Only allowed in Draft state.
     * Recalculates balance after adding the line item.
     */
    public void addLineItem(InvoiceLineItem lineItem) {
        if (status != InvoiceStatus.DRAFT) {
            throw new IllegalStateException("Cannot add line items to invoice in " + status + " state. Only Draft invoices can be modified.");
        }
        if (lineItem == null) {
            throw new IllegalArgumentException("Line item cannot be null");
        }
        lineItems.add(lineItem);
        recalculateBalance();
        this.updatedAt = LocalDateTime.now();
    }
    
    /**
     * Updates invoice details.
     * Only allowed in Draft state.
     */
    public void updateCustomerId(UUID customerId) {
        if (status != InvoiceStatus.DRAFT) {
            throw new IllegalStateException("Cannot update invoice in " + status + " state. Only Draft invoices can be modified.");
        }
        if (customerId == null) {
            throw new IllegalArgumentException("Customer ID cannot be null");
        }
        this.customerId = customerId;
        this.updatedAt = LocalDateTime.now();
    }
    
    /**
     * Marks the invoice as Sent.
     * State transition: Draft → Sent
     * Only allowed from Draft state.
     */
    public void markAsSent() {
        if (status != InvoiceStatus.DRAFT) {
            throw new IllegalStateException("Cannot mark invoice as Sent from " + status + " state. Only Draft invoices can be sent.");
        }
        this.status = InvoiceStatus.SENT;
        this.updatedAt = LocalDateTime.now();
    }
    
    /**
     * Applies a payment to the invoice.
     * Reduces balance and transitions to Paid state if balance reaches zero.
     * State transition: Sent → Paid (when balance reaches zero)
     * Only allowed in Sent state.
     */
    public void applyPayment(BigDecimal paymentAmount) {
        if (status != InvoiceStatus.SENT) {
            throw new IllegalStateException("Cannot apply payment to invoice in " + status + " state. Only Sent invoices can receive payments.");
        }
        if (paymentAmount == null || paymentAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Payment amount must be greater than zero");
        }
        if (paymentAmount.compareTo(balance) > 0) {
            throw new IllegalArgumentException("Payment amount cannot exceed invoice balance");
        }
        
        this.balance = this.balance.subtract(paymentAmount);
        
        // Transition to Paid state if balance reaches zero
        if (this.balance.compareTo(BigDecimal.ZERO) == 0) {
            this.status = InvoiceStatus.PAID;
        }
        
        this.updatedAt = LocalDateTime.now();
    }
    
    /**
     * Recalculates the invoice balance from line items.
     * Balance = sum of (quantity × unit price) for all line items.
     */
    private void recalculateBalance() {
        this.balance = lineItems.stream()
                .map(InvoiceLineItem::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
    
    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.balance == null) {
            this.balance = BigDecimal.ZERO;
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}


