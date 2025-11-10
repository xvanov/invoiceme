package com.invoiceme.application.queries.customer;

import com.invoiceme.domain.customer.Customer;
import com.invoiceme.infrastructure.persistence.customer.CustomerRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ListCustomersQueryHandler {
    private final CustomerRepository customerRepository;
    
    public ListCustomersQueryHandler(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }
    
    public List<Customer> handle(ListCustomersQuery query) {
        return customerRepository.findAll();
    }
}


