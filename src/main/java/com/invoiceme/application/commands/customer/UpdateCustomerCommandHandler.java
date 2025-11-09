package com.invoiceme.application.commands.customer;

import com.invoiceme.domain.customer.Customer;
import com.invoiceme.infrastructure.persistence.customer.CustomerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class UpdateCustomerCommandHandler {
    private final CustomerRepository customerRepository;
    
    public UpdateCustomerCommandHandler(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }
    
    @Transactional
    public Customer handle(UpdateCustomerCommand command) {
        Customer customer = customerRepository.findById(command.customerId())
                .orElseThrow(() -> new RuntimeException("Customer not found with id: " + command.customerId()));
        
        customer.setName(command.name());
        customer.setEmail(command.email());
        
        return customerRepository.save(customer);
    }
}

