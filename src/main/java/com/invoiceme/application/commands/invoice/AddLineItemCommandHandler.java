package com.invoiceme.application.commands.invoice;

import com.invoiceme.api.exceptions.NotFoundException;
import com.invoiceme.domain.invoice.Invoice;
import com.invoiceme.domain.invoice.InvoiceLineItem;
import com.invoiceme.infrastructure.persistence.invoice.InvoiceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class AddLineItemCommandHandler {
    private final InvoiceRepository invoiceRepository;
    
    public AddLineItemCommandHandler(InvoiceRepository invoiceRepository) {
        this.invoiceRepository = invoiceRepository;
    }
    
    @Transactional
    public Invoice handle(AddLineItemCommand command) {
        Invoice invoice = invoiceRepository.findById(command.invoiceId())
                .orElseThrow(() -> new NotFoundException("Invoice not found with id: " + command.invoiceId()));
        
        InvoiceLineItem lineItem = new InvoiceLineItem(
                command.description(),
                command.quantity(),
                command.unitPrice()
        );
        
        invoice.addLineItem(lineItem);
        return invoiceRepository.save(invoice);
    }
}

