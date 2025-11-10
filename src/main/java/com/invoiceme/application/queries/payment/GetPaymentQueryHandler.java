package com.invoiceme.application.queries.payment;

import com.invoiceme.domain.payment.Payment;
import com.invoiceme.infrastructure.persistence.payment.PaymentRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
public class GetPaymentQueryHandler {
    private final PaymentRepository paymentRepository;
    
    public GetPaymentQueryHandler(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }
    
    public Optional<Payment> handle(GetPaymentQuery query) {
        return paymentRepository.findById(query.paymentId());
    }
}


