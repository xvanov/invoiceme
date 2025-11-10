package com.invoiceme.application.queries.invoice;

import com.invoiceme.domain.invoice.Invoice;
import com.invoiceme.infrastructure.persistence.invoice.InvoiceRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class ListInvoicesQueryHandler {
    private final InvoiceRepository invoiceRepository;
    
    public ListInvoicesQueryHandler(InvoiceRepository invoiceRepository) {
        this.invoiceRepository = invoiceRepository;
    }
    
    public List<Invoice> handle(ListInvoicesQuery query) {
        if (query.customerId().isPresent() && query.status().isPresent()) {
            return invoiceRepository.findByCustomerIdAndStatus(
                    query.customerId().get(),
                    query.status().get()
            );
        } else if (query.customerId().isPresent()) {
            return invoiceRepository.findByCustomerId(query.customerId().get());
        } else if (query.status().isPresent()) {
            return invoiceRepository.findByStatus(query.status().get());
        } else {
            return invoiceRepository.findAll();
        }
    }
}


