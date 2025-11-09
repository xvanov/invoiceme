package com.invoiceme.application.queries.invoice;

import com.invoiceme.domain.invoice.Invoice;
import com.invoiceme.infrastructure.persistence.invoice.InvoiceRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
public class GetInvoiceQueryHandler {
    private final InvoiceRepository invoiceRepository;
    
    public GetInvoiceQueryHandler(InvoiceRepository invoiceRepository) {
        this.invoiceRepository = invoiceRepository;
    }
    
    public Optional<Invoice> handle(GetInvoiceQuery query) {
        return invoiceRepository.findById(query.invoiceId());
    }
}

