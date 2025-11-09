package com.invoiceme.application.commands.customer;

import com.invoiceme.infrastructure.persistence.customer.CustomerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class DeleteCustomerCommandHandler {
    private final CustomerRepository customerRepository;
    
    public DeleteCustomerCommandHandler(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }
    
    @Transactional
    public void handle(DeleteCustomerCommand command) {
        if (!customerRepository.existsById(command.customerId())) {
            throw new RuntimeException("Customer not found with id: " + command.customerId());
        }
        customerRepository.deleteById(command.customerId());
    }
}

