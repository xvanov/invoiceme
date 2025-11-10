package com.invoiceme.application.commands.customer;

import com.invoiceme.domain.customer.Customer;
import com.invoiceme.infrastructure.persistence.customer.CustomerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CreateCustomerCommandHandler {
    private final CustomerRepository customerRepository;
    
    public CreateCustomerCommandHandler(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }
    
    @Transactional
    public Customer handle(CreateCustomerCommand command) {
        Customer customer = new Customer(command.name(), command.email());
        return customerRepository.save(customer);
    }
}


