package com.invoiceme.api.invoices;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public class CreateInvoiceRequest {
    @NotNull(message = "Customer ID is required")
    private UUID customerId;
    
    public CreateInvoiceRequest() {}
    
    public CreateInvoiceRequest(UUID customerId) {
        this.customerId = customerId;
    }
    
    public UUID getCustomerId() {
        return customerId;
    }
    
    public void setCustomerId(UUID customerId) {
        this.customerId = customerId;
    }
}


