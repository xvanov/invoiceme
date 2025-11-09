package com.invoiceme.domain.customer;

import java.util.Objects;
import java.util.UUID;

/**
 * Value object representing a Customer ID.
 * Encapsulates the UUID identifier for type safety and domain clarity.
 */
public final class CustomerId {
    private final UUID value;
    
    private CustomerId(UUID value) {
        if (value == null) {
            throw new IllegalArgumentException("Customer ID cannot be null");
        }
        this.value = value;
    }
    
    public static CustomerId of(UUID value) {
        return new CustomerId(value);
    }
    
    public static CustomerId of(String value) {
        return new CustomerId(UUID.fromString(value));
    }
    
    public UUID getValue() {
        return value;
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        CustomerId that = (CustomerId) o;
        return Objects.equals(value, that.value);
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

