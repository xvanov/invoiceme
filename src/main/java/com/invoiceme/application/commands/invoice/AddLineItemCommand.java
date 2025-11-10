package com.invoiceme.application.commands.invoice;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.util.UUID;

public record AddLineItemCommand(
    @NotNull(message = "Invoice ID is required")
    UUID invoiceId,
    
    @NotBlank(message = "Description is required")
    String description,
    
    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be greater than zero")
    Integer quantity,
    
    @NotNull(message = "Unit price is required")
    @Positive(message = "Unit price must be greater than zero")
    BigDecimal unitPrice
) {}


