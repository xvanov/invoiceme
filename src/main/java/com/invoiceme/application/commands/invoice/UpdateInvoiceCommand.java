package com.invoiceme.application.commands.invoice;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record UpdateInvoiceCommand(
    @NotNull(message = "Invoice ID is required")
    UUID invoiceId,
    
    @NotNull(message = "Customer ID is required")
    UUID customerId
) {}


