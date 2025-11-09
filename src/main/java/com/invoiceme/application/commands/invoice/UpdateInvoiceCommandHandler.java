package com.invoiceme.application.commands.invoice;

import com.invoiceme.api.exceptions.NotFoundException;
import com.invoiceme.domain.invoice.Invoice;
import com.invoiceme.infrastructure.persistence.invoice.InvoiceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class UpdateInvoiceCommandHandler {
    private final InvoiceRepository invoiceRepository;
    
    public UpdateInvoiceCommandHandler(InvoiceRepository invoiceRepository) {
        this.invoiceRepository = invoiceRepository;
    }
    
    @Transactional
    public Invoice handle(UpdateInvoiceCommand command) {
        Invoice invoice = invoiceRepository.findById(command.invoiceId())
                .orElseThrow(() -> new NotFoundException("Invoice not found with id: " + command.invoiceId()));
        
        invoice.updateCustomerId(command.customerId());
        return invoiceRepository.save(invoice);
    }
}

