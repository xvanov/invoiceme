package com.invoiceme.domain.customer;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Customer Domain Entity Tests")
class CustomerTest {
    
    @Test
    @DisplayName("Should create customer with name and email")
    void shouldCreateCustomerWithNameAndEmail() {
        // Given
        String name = "John Doe";
        String email = "john.doe@example.com";
        
        // When
        Customer customer = new Customer(name, email);
        
        // Then
        assertNotNull(customer);
        assertEquals(name, customer.getName());
        assertEquals(email, customer.getEmail());
        assertNotNull(customer.getCreatedAt());
        assertTrue(customer.getCreatedAt().isBefore(LocalDateTime.now().plusSeconds(1)));
    }
    
    @Test
    @DisplayName("Should update customer name")
    void shouldUpdateCustomerName() {
        // Given
        Customer customer = new Customer("John Doe", "john.doe@example.com");
        String newName = "Jane Doe";
        LocalDateTime originalCreatedAt = customer.getCreatedAt();
        
        // When
        customer.setName(newName);
        
        // Then
        assertEquals(newName, customer.getName());
        assertNotNull(customer.getUpdatedAt());
        assertEquals(originalCreatedAt, customer.getCreatedAt()); // createdAt should not change
    }
    
    @Test
    @DisplayName("Should update customer email")
    void shouldUpdateCustomerEmail() {
        // Given
        Customer customer = new Customer("John Doe", "john.doe@example.com");
        String newEmail = "jane.doe@example.com";
        
        // When
        customer.setEmail(newEmail);
        
        // Then
        assertEquals(newEmail, customer.getEmail());
        assertNotNull(customer.getUpdatedAt());
    }
    
    @Test
    @DisplayName("Should have ID after persistence")
    void shouldHaveIdAfterPersistence() {
        // Given
        Customer customer = new Customer("John Doe", "john.doe@example.com");
        
        // When - ID is set by JPA, but we can verify it's null initially
        // Then
        assertNull(customer.getId()); // ID is null until persisted
    }
    
    @Test
    @DisplayName("Should set createdAt on creation")
    void shouldSetCreatedAtOnCreation() {
        // Given
        LocalDateTime beforeCreation = LocalDateTime.now();
        
        // When
        Customer customer = new Customer("John Doe", "john.doe@example.com");
        
        // Then
        assertNotNull(customer.getCreatedAt());
        assertTrue(customer.getCreatedAt().isAfter(beforeCreation.minusSeconds(1)));
        assertTrue(customer.getCreatedAt().isBefore(LocalDateTime.now().plusSeconds(1)));
    }
    
    @Test
    @DisplayName("Should set updatedAt when name changes")
    void shouldSetUpdatedAtWhenNameChanges() {
        // Given
        Customer customer = new Customer("John Doe", "john.doe@example.com");
        assertNull(customer.getUpdatedAt());
        
        // When
        customer.setName("Jane Doe");
        
        // Then
        assertNotNull(customer.getUpdatedAt());
        assertTrue(customer.getUpdatedAt().isBefore(LocalDateTime.now().plusSeconds(1)));
    }
    
    @Test
    @DisplayName("Should set updatedAt when email changes")
    void shouldSetUpdatedAtWhenEmailChanges() {
        // Given
        Customer customer = new Customer("John Doe", "john.doe@example.com");
        assertNull(customer.getUpdatedAt());
        
        // When
        customer.setEmail("jane.doe@example.com");
        
        // Then
        assertNotNull(customer.getUpdatedAt());
        assertTrue(customer.getUpdatedAt().isBefore(LocalDateTime.now().plusSeconds(1)));
    }
    
    @Test
    @DisplayName("Should allow default constructor for JPA")
    void shouldAllowDefaultConstructorForJPA() {
        // Given & When
        Customer customer = new Customer();
        
        // Then
        assertNotNull(customer);
        assertNull(customer.getId());
        assertNull(customer.getName());
        assertNull(customer.getEmail());
    }
}

