package com.invoiceme.api.customers;

import com.invoiceme.application.commands.customer.*;
import com.invoiceme.application.queries.customer.*;
import com.invoiceme.domain.customer.Customer;
import com.invoiceme.infrastructure.persistence.customer.CustomerRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureWebMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
@AutoConfigureWebMvc
@ActiveProfiles("test")
@DisplayName("Customer API Integration Tests")
class CustomerControllerTest {
    
    @Autowired
    private MockMvc mockMvc;
    
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
    void setUp() {
        testCustomerId = UUID.randomUUID();
    }
    
    private Customer createCustomerWithId(String name, String email, UUID id) {
        Customer customer = new Customer(name, email);
        // Use reflection to set ID for testing purposes
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
    @DisplayName("POST /api/customers - should create new customer")
    void shouldCreateNewCustomer() throws Exception {
        // Given
        CreateCustomerRequest request = new CreateCustomerRequest("John Doe", "john.doe@example.com");
        Customer savedCustomer = createCustomerWithId("John Doe", "john.doe@example.com", testCustomerId);
        
        when(createCustomerCommandHandler.handle(any())).thenReturn(savedCustomer);
        
        // When & Then
        mockMvc.perform(post("/api/customers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("John Doe"))
                .andExpect(jsonPath("$.email").value("john.doe@example.com"));
        
        verify(createCustomerCommandHandler, times(1)).handle(any());
    }
    
    @Test
    @DisplayName("GET /api/customers/{id} - should retrieve customer by ID")
    void shouldRetrieveCustomerById() throws Exception {
        // Given
        Customer customer = createCustomerWithId("John Doe", "john.doe@example.com", testCustomerId);
        
        when(getCustomerQueryHandler.handle(any())).thenReturn(Optional.of(customer));
        
        // When & Then
        mockMvc.perform(get("/api/customers/" + testCustomerId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("John Doe"))
                .andExpect(jsonPath("$.email").value("john.doe@example.com"));
        
        verify(getCustomerQueryHandler, times(1)).handle(any());
    }
    
    @Test
    @DisplayName("GET /api/customers - should list all customers")
    void shouldListAllCustomers() throws Exception {
        // Given
        Customer customer1 = createCustomerWithId("John Doe", "john.doe@example.com", UUID.randomUUID());
        Customer customer2 = createCustomerWithId("Jane Smith", "jane.smith@example.com", UUID.randomUUID());
        
        when(listCustomersQueryHandler.handle(any())).thenReturn(List.of(customer1, customer2));
        
        // When & Then
        mockMvc.perform(get("/api/customers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].name").value("John Doe"))
                .andExpect(jsonPath("$[1].name").value("Jane Smith"));
        
        verify(listCustomersQueryHandler, times(1)).handle(any());
    }
    
    @Test
    @DisplayName("PUT /api/customers/{id} - should update customer information")
    void shouldUpdateCustomerInformation() throws Exception {
        // Given
        Customer existingCustomer = createCustomerWithId("John Doe", "john.doe@example.com", testCustomerId);
        CreateCustomerRequest updateRequest = new CreateCustomerRequest("Jane Doe", "jane.doe@example.com");
        Customer updatedCustomer = createCustomerWithId("Jane Doe", "jane.doe@example.com", testCustomerId);
        
        when(updateCustomerCommandHandler.handle(any())).thenReturn(updatedCustomer);
        
        // When & Then
        mockMvc.perform(put("/api/customers/" + testCustomerId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Jane Doe"))
                .andExpect(jsonPath("$.email").value("jane.doe@example.com"));
        
        verify(updateCustomerCommandHandler, times(1)).handle(any());
    }
    
    @Test
    @DisplayName("DELETE /api/customers/{id} - should delete customer")
    void shouldDeleteCustomer() throws Exception {
        // Given
        doNothing().when(deleteCustomerCommandHandler).handle(any());
        
        // When & Then
        mockMvc.perform(delete("/api/customers/" + testCustomerId))
                .andExpect(status().isOk());
        
        verify(deleteCustomerCommandHandler, times(1)).handle(any());
    }
    
    @Test
    @DisplayName("POST /api/customers - should reject customer with empty name")
    void shouldRejectCustomerWithEmptyName() throws Exception {
        // Given
        CreateCustomerRequest request = new CreateCustomerRequest("", "john.doe@example.com");
        
        // When & Then
        mockMvc.perform(post("/api/customers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
        
        verify(createCustomerCommandHandler, never()).handle(any());
    }
    
    @Test
    @DisplayName("POST /api/customers - should reject customer with invalid email")
    void shouldRejectCustomerWithInvalidEmail() throws Exception {
        // Given
        CreateCustomerRequest request = new CreateCustomerRequest("John Doe", "invalid-email");
        
        // When & Then
        mockMvc.perform(post("/api/customers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
        
        verify(createCustomerCommandHandler, never()).handle(any());
    }
    
    @Test
    @DisplayName("GET /api/customers/{id} - should return 404 for non-existent customer")
    void shouldReturn404ForNonExistentCustomer() throws Exception {
        // Given
        when(getCustomerQueryHandler.handle(any())).thenReturn(Optional.empty());
        
        // When & Then
        mockMvc.perform(get("/api/customers/" + testCustomerId))
                .andExpect(status().isNotFound());
        
        verify(getCustomerQueryHandler, times(1)).handle(any());
    }
}

