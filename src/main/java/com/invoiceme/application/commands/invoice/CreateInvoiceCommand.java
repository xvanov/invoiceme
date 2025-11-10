package com.invoiceme.application.commands.invoice;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record CreateInvoiceCommand(
    @NotNull(message = "Customer ID is required")
    UUID customerId
) {}


