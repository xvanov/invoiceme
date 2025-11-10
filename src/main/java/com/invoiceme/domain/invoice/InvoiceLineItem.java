package com.invoiceme.domain.invoice;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.Objects;
import java.util.UUID;

/**
 * Value object representing a line item on an invoice.
 * Encapsulates description, quantity, and unit price with subtotal calculation.
 */
@Embeddable
public class InvoiceLineItem {
    @Column(name = "line_item_id")
    private UUID lineItemId;
    
    @Column(name = "description", nullable = false)
    private String description;
    
    @Column(name = "quantity", nullable = false)
    private Integer quantity;
    
    @Column(name = "unit_price", nullable = false, precision = 19, scale = 2)
    private BigDecimal unitPrice;
    
    // Default constructor for JPA
    protected InvoiceLineItem() {}
    
    // Constructor for creating new line items
    public InvoiceLineItem(String description, Integer quantity, BigDecimal unitPrice) {
        if (description == null || description.trim().isEmpty()) {
            throw new IllegalArgumentException("Description cannot be null or empty");
        }
        if (quantity == null || quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than zero");
        }
        if (unitPrice == null || unitPrice.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Unit price cannot be null or negative");
        }
        this.lineItemId = UUID.randomUUID();
        this.description = description;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
    }
    
    public UUID getLineItemId() {
        return lineItemId;
    }
    
    public String getDescription() {
        return description;
    }
    
    public Integer getQuantity() {
        return quantity;
    }
    
    public BigDecimal getUnitPrice() {
        return unitPrice;
    }
    
    /**
     * Calculates the subtotal for this line item (quantity × unit price).
     */
    public BigDecimal getSubtotal() {
        return unitPrice.multiply(BigDecimal.valueOf(quantity));
    }
    
    public void updateDescription(String description) {
        if (description == null || description.trim().isEmpty()) {
            throw new IllegalArgumentException("Description cannot be null or empty");
        }
        this.description = description;
    }
    
    public void updateQuantity(Integer quantity) {
        if (quantity == null || quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than zero");
        }
        this.quantity = quantity;
    }
    
    public void updateUnitPrice(BigDecimal unitPrice) {
        if (unitPrice == null || unitPrice.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Unit price cannot be null or negative");
        }
        this.unitPrice = unitPrice;
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        InvoiceLineItem that = (InvoiceLineItem) o;
        return Objects.equals(lineItemId, that.lineItemId);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(lineItemId);
    }
}


