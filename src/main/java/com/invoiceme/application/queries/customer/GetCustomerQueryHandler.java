package com.invoiceme.application.queries.customer;

import com.invoiceme.domain.customer.Customer;
import com.invoiceme.infrastructure.persistence.customer.CustomerRepository;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.Optional;

@Service
public class GetCustomerQueryHandler {
    private final CustomerRepository customerRepository;
    
    public GetCustomerQueryHandler(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }
    
    public Optional<Customer> handle(GetCustomerQuery query) {
        return customerRepository.findById(query.customerId());
    }
}

