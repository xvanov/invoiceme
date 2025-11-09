package com.invoiceme.application.commands.invoice;

import com.invoiceme.domain.invoice.Invoice;
import com.invoiceme.infrastructure.persistence.invoice.InvoiceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CreateInvoiceCommandHandler {
    private final InvoiceRepository invoiceRepository;
    
    public CreateInvoiceCommandHandler(InvoiceRepository invoiceRepository) {
        this.invoiceRepository = invoiceRepository;
    }
    
    @Transactional
    public Invoice handle(CreateInvoiceCommand command) {
        Invoice invoice = new Invoice(command.customerId());
        return invoiceRepository.save(invoice);
    }
}

