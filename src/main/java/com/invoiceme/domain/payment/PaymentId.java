package com.invoiceme.domain.payment;

import java.util.Objects;
import java.util.UUID;

/**
 * Value object representing a Payment ID.
 * Encapsulates the UUID identifier for type safety and domain clarity.
 */
public final class PaymentId {
    private final UUID value;
    
    private PaymentId(UUID value) {
        if (value == null) {
            throw new IllegalArgumentException("Payment ID cannot be null");
        }
        this.value = value;
    }
    
    public static PaymentId of(UUID value) {
        return new PaymentId(value);
    }
    
    public static PaymentId of(String value) {
        return new PaymentId(UUID.fromString(value));
    }
    
    public UUID getValue() {
        return value;
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        PaymentId paymentId = (PaymentId) o;
        return Objects.equals(value, paymentId.value);
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


