package com.invoiceme.api.customers;

import com.invoiceme.application.commands.customer.*;
import com.invoiceme.application.queries.customer.*;
import com.invoiceme.domain.customer.Customer;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {
    private final CreateCustomerCommandHandler createCustomerCommandHandler;
    private final UpdateCustomerCommandHandler updateCustomerCommandHandler;
    private final DeleteCustomerCommandHandler deleteCustomerCommandHandler;
    private final GetCustomerQueryHandler getCustomerQueryHandler;
    private final ListCustomersQueryHandler listCustomersQueryHandler;
    
    public CustomerController(
            CreateCustomerCommandHandler createCustomerCommandHandler,
            UpdateCustomerCommandHandler updateCustomerCommandHandler,
            DeleteCustomerCommandHandler deleteCustomerCommandHandler,
            GetCustomerQueryHandler getCustomerQueryHandler,
            ListCustomersQueryHandler listCustomersQueryHandler) {
        this.createCustomerCommandHandler = createCustomerCommandHandler;
        this.updateCustomerCommandHandler = updateCustomerCommandHandler;
        this.deleteCustomerCommandHandler = deleteCustomerCommandHandler;
        this.getCustomerQueryHandler = getCustomerQueryHandler;
        this.listCustomersQueryHandler = listCustomersQueryHandler;
    }
    
    @PostMapping
    public ResponseEntity<CustomerDto> createCustomer(@Valid @RequestBody CreateCustomerRequest request) {
        CreateCustomerCommand command = new CreateCustomerCommand(request.getName(), request.getEmail());
        Customer saved = createCustomerCommandHandler.handle(command);
        
        CustomerDto dto = new CustomerDto(saved.getId(), saved.getName(), saved.getEmail());
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<CustomerDto> getCustomer(@PathVariable UUID id) {
        GetCustomerQuery query = new GetCustomerQuery(id);
        return getCustomerQueryHandler.handle(query)
                .map(customer -> {
                    CustomerDto dto = new CustomerDto(customer.getId(), customer.getName(), customer.getEmail());
                    return ResponseEntity.ok(dto);
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping
    public ResponseEntity<List<CustomerDto>> listCustomers() {
        ListCustomersQuery query = new ListCustomersQuery();
        List<CustomerDto> customers = listCustomersQueryHandler.handle(query).stream()
                .map(customer -> new CustomerDto(customer.getId(), customer.getName(), customer.getEmail()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(customers);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<CustomerDto> updateCustomer(@PathVariable UUID id, @Valid @RequestBody CreateCustomerRequest request) {
        UpdateCustomerCommand command = new UpdateCustomerCommand(id, request.getName(), request.getEmail());
        try {
            Customer updated = updateCustomerCommandHandler.handle(command);
            CustomerDto dto = new CustomerDto(updated.getId(), updated.getName(), updated.getEmail());
            return ResponseEntity.ok(dto);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCustomer(@PathVariable UUID id) {
        DeleteCustomerCommand command = new DeleteCustomerCommand(id);
        try {
            deleteCustomerCommandHandler.handle(command);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}

