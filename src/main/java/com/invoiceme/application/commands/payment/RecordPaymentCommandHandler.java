package com.invoiceme.application.commands.payment;

import com.invoiceme.api.exceptions.NotFoundException;
import com.invoiceme.domain.invoice.Invoice;
import com.invoiceme.domain.payment.Payment;
import com.invoiceme.infrastructure.persistence.invoice.InvoiceRepository;
import com.invoiceme.infrastructure.persistence.payment.PaymentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class RecordPaymentCommandHandler {
    private final PaymentRepository paymentRepository;
    private final InvoiceRepository invoiceRepository;
    
    public RecordPaymentCommandHandler(
            PaymentRepository paymentRepository,
            InvoiceRepository invoiceRepository) {
        this.paymentRepository = paymentRepository;
        this.invoiceRepository = invoiceRepository;
    }
    
    @Transactional
    public Payment handle(RecordPaymentCommand command) {
        Invoice invoice = invoiceRepository.findById(command.invoiceId())
                .orElseThrow(() -> new NotFoundException("Invoice not found with id: " + command.invoiceId()));
        
        invoice.applyPayment(command.amount());
        invoiceRepository.save(invoice);
        
        Payment payment = new Payment(command.invoiceId(), command.amount(), command.paymentDate());
        return paymentRepository.save(payment);
    }
}

