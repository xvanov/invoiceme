package com.invoiceme.application.queries.payment;

import com.invoiceme.domain.payment.Payment;
import com.invoiceme.infrastructure.persistence.payment.PaymentRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class ListPaymentsQueryHandler {
    private final PaymentRepository paymentRepository;
    
    public ListPaymentsQueryHandler(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }
    
    public List<Payment> handle(ListPaymentsQuery query) {
        return paymentRepository.findByInvoiceId(query.invoiceId());
    }
}


