package com.invoiceme.api.invoices;

import java.math.BigDecimal;
import java.util.UUID;

public class InvoiceLineItemDto {
    private UUID lineItemId;
    private String description;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal subtotal;
    
    // Default constructor
    public InvoiceLineItemDto() {}
    
    // Constructor with all fields
    public InvoiceLineItemDto(UUID lineItemId, String description, Integer quantity, BigDecimal unitPrice, BigDecimal subtotal) {
        this.lineItemId = lineItemId;
        this.description = description;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        this.subtotal = subtotal;
    }
    
    // Getters and setters
    public UUID getLineItemId() {
        return lineItemId;
    }
    
    public void setLineItemId(UUID lineItemId) {
        this.lineItemId = lineItemId;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public Integer getQuantity() {
        return quantity;
    }
    
    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
    
    public BigDecimal getUnitPrice() {
        return unitPrice;
    }
    
    public void setUnitPrice(BigDecimal unitPrice) {
        this.unitPrice = unitPrice;
    }
    
    public BigDecimal getSubtotal() {
        return subtotal;
    }
    
    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }
}

