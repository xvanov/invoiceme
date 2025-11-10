package com.invoiceme.performance;

import com.invoiceme.api.customers.CreateCustomerRequest;
import com.invoiceme.application.commands.customer.*;
import com.invoiceme.application.queries.customer.*;
import com.invoiceme.domain.customer.Customer;
import com.invoiceme.infrastructure.persistence.customer.CustomerRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Performance tests for Customer API endpoints.
 * 
 * Verifies that all Customer API operations complete in under 200ms (AC #2).
 * 
 * Tests:
 * - POST /api/customers (create customer)
 * - GET /api/customers/{id} (retrieve customer)
 * - GET /api/customers (list customers)
 * - PUT /api/customers/{id} (update customer)
 * - DELETE /api/customers/{id} (delete customer)
 */
@DisplayName("Customer API Performance Tests")
class CustomerApiPerformanceTest extends ApiPerformanceTest {
    
    @MockBean
    private CustomerRepository customerRepository;
    
    @MockBean
    private CreateCustomerCommandHandler createCustomerCommandHandler;
    
    @MockBean
    private UpdateCustomerCommandHandler updateCustomerCommandHandler;
    
    @MockBean
    private DeleteCustomerCommandHandler deleteCustomerCommandHandler;
    
    @MockBean
    private GetCustomerQueryHandler getCustomerQueryHandler;
    
    @MockBean
    private ListCustomersQueryHandler listCustomersQueryHandler;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    private UUID testCustomerId;
    
    @BeforeEach
    @Override
    void setUp() {
        super.setUp();
        testCustomerId = UUID.randomUUID();
    }
    
    private Customer createCustomerWithId(String name, String email, UUID id) {
        Customer customer = new Customer(name, email);
        try {
            java.lang.reflect.Field idField = Customer.class.getDeclaredField("id");
            idField.setAccessible(true);
            idField.set(customer, id);
        } catch (Exception e) {
            throw new RuntimeException("Failed to set customer ID for testing", e);
        }
        return customer;
    }
    
    @Test
    @DisplayName("POST /api/customers - should complete in under 200ms")
    void testCreateCustomerPerformance() throws Exception {
        // Given
        CreateCustomerRequest request = new CreateCustomerRequest("John Doe", "john.doe@example.com");
        Customer savedCustomer = createCustomerWithId("John Doe", "john.doe@example.com", testCustomerId);
        
        when(createCustomerCommandHandler.handle(any())).thenReturn(savedCustomer);
        
        PerformanceTimer timer = createTimer();
        
        // When
        timer.start();
        mockMvc.perform(post("/api/customers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("John Doe"))
                .andExpect(jsonPath("$.email").value("john.doe@example.com"));
        timer.stop();
        
        // Then
        timer.assertUnderApiThreshold("POST /api/customers (create customer)");
        
        verify(createCustomerCommandHandler, times(1)).handle(any());
    }
    
    @Test
    @DisplayName("GET /api/customers/{id} - should complete in under 200ms")
    void testRetrieveCustomerPerformance() throws Exception {
        // Given
        Customer customer = createCustomerWithId("John Doe", "john.doe@example.com", testCustomerId);
        
        when(getCustomerQueryHandler.handle(any())).thenReturn(Optional.of(customer));
        
        PerformanceTimer timer = createTimer();
        
        // When
        timer.start();
        mockMvc.perform(get("/api/customers/" + testCustomerId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("John Doe"))
                .andExpect(jsonPath("$.email").value("john.doe@example.com"));
        timer.stop();
        
        // Then
        timer.assertUnderApiThreshold("GET /api/customers/{id} (retrieve customer)");
        
        verify(getCustomerQueryHandler, times(1)).handle(any());
    }
    
    @Test
    @DisplayName("GET /api/customers - should complete in under 200ms")
    void testListCustomersPerformance() throws Exception {
        // Given
        Customer customer1 = createCustomerWithId("John Doe", "john.doe@example.com", UUID.randomUUID());
        Customer customer2 = createCustomerWithId("Jane Smith", "jane.smith@example.com", UUID.randomUUID());
        
        when(listCustomersQueryHandler.handle(any())).thenReturn(List.of(customer1, customer2));
        
        PerformanceTimer timer = createTimer();
        
        // When
        timer.start();
        mockMvc.perform(get("/api/customers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].name").value("John Doe"))
                .andExpect(jsonPath("$[1].name").value("Jane Smith"));
        timer.stop();
        
        // Then
        timer.assertUnderApiThreshold("GET /api/customers (list customers)");
        
        verify(listCustomersQueryHandler, times(1)).handle(any());
    }
    
    @Test
    @DisplayName("PUT /api/customers/{id} - should complete in under 200ms")
    void testUpdateCustomerPerformance() throws Exception {
        // Given
        Customer existingCustomer = createCustomerWithId("John Doe", "john.doe@example.com", testCustomerId);
        CreateCustomerRequest updateRequest = new CreateCustomerRequest("Jane Doe", "jane.doe@example.com");
        Customer updatedCustomer = createCustomerWithId("Jane Doe", "jane.doe@example.com", testCustomerId);
        
        when(updateCustomerCommandHandler.handle(any())).thenReturn(updatedCustomer);
        
        PerformanceTimer timer = createTimer();
        
        // When
        timer.start();
        mockMvc.perform(put("/api/customers/" + testCustomerId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Jane Doe"))
                .andExpect(jsonPath("$.email").value("jane.doe@example.com"));
        timer.stop();
        
        // Then
        timer.assertUnderApiThreshold("PUT /api/customers/{id} (update customer)");
        
        verify(updateCustomerCommandHandler, times(1)).handle(any());
    }
    
    @Test
    @DisplayName("DELETE /api/customers/{id} - should complete in under 200ms")
    void testDeleteCustomerPerformance() throws Exception {
        // Given
        doNothing().when(deleteCustomerCommandHandler).handle(any());
        
        PerformanceTimer timer = createTimer();
        
        // When
        timer.start();
        mockMvc.perform(delete("/api/customers/" + testCustomerId))
                .andExpect(status().isOk());
        timer.stop();
        
        // Then
        timer.assertUnderApiThreshold("DELETE /api/customers/{id} (delete customer)");
        
        verify(deleteCustomerCommandHandler, times(1)).handle(any());
    }
}

