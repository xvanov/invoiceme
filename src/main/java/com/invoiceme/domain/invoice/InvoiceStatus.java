package com.invoiceme.domain.invoice;

/**
 * Enum representing the lifecycle states of an Invoice.
 * State transitions: Draft → Sent → Paid
 */
public enum InvoiceStatus {
    DRAFT,
    SENT,
    PAID
}


