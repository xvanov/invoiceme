package com.invoiceme.application.queries.invoice;

import com.invoiceme.domain.invoice.InvoiceStatus;

import java.util.Optional;
import java.util.UUID;

public record ListInvoicesQuery(
    Optional<UUID> customerId,
    Optional<InvoiceStatus> status
) {
    public ListInvoicesQuery() {
        this(Optional.empty(), Optional.empty());
    }
}


