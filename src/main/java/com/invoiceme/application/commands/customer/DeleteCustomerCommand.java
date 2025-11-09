package com.invoiceme.application.commands.customer;

import java.util.UUID;

public record DeleteCustomerCommand(UUID customerId) {}

