package com.invoiceme.domain.invoice;

import java.util.Objects;
import java.util.UUID;

/**
 * Value object representing an Invoice ID.
 * Encapsulates the UUID identifier for type safety and domain clarity.
 */
public final class InvoiceId {
    private final UUID value;
    
    private InvoiceId(UUID value) {
        if (value == null) {
            throw new IllegalArgumentException("Invoice ID cannot be null");
        }
        this.value = value;
    }
    
    public static InvoiceId of(UUID value) {
        return new InvoiceId(value);
    }
    
    public static InvoiceId of(String value) {
        return new InvoiceId(UUID.fromString(value));
    }
    
    public UUID getValue() {
        return value;
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        InvoiceId invoiceId = (InvoiceId) o;
        return Objects.equals(value, invoiceId.value);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(value);
    }
    
    @Override
    public String toString() {
        return value.toString();
    }
}


