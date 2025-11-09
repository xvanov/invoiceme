package com.invoiceme.application.commands.invoice;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record SendInvoiceCommand(
    @NotNull(message = "Invoice ID is required")
    UUID invoiceId
) {}

