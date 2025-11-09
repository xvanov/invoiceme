package com.invoiceme.api.payments;

import com.invoiceme.application.commands.payment.RecordPaymentCommand;
import com.invoiceme.application.commands.payment.RecordPaymentCommandHandler;
import com.invoiceme.application.queries.payment.GetPaymentQuery;
import com.invoiceme.application.queries.payment.GetPaymentQueryHandler;
import com.invoiceme.application.queries.payment.ListPaymentsQuery;
import com.invoiceme.application.queries.payment.ListPaymentsQueryHandler;
import com.invoiceme.domain.payment.Payment;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {
    private final RecordPaymentCommandHandler recordPaymentCommandHandler;
    private final GetPaymentQueryHandler getPaymentQueryHandler;
    private final ListPaymentsQueryHandler listPaymentsQueryHandler;
    
    public PaymentController(
            RecordPaymentCommandHandler recordPaymentCommandHandler,
            GetPaymentQueryHandler getPaymentQueryHandler,
            ListPaymentsQueryHandler listPaymentsQueryHandler) {
        this.recordPaymentCommandHandler = recordPaymentCommandHandler;
        this.getPaymentQueryHandler = getPaymentQueryHandler;
        this.listPaymentsQueryHandler = listPaymentsQueryHandler;
    }
    
    @PostMapping
    public ResponseEntity<PaymentDto> recordPayment(@Valid @RequestBody RecordPaymentRequest request) {
        RecordPaymentCommand command = new RecordPaymentCommand(
                request.getInvoiceId(),
                request.getAmount(),
                request.getPaymentDate()
        );
        Payment saved = recordPaymentCommandHandler.handle(command);
        PaymentDto dto = toDto(saved);
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<PaymentDto> getPayment(@PathVariable UUID id) {
        GetPaymentQuery query = new GetPaymentQuery(id);
        return getPaymentQueryHandler.handle(query)
                .map(payment -> ResponseEntity.ok(toDto(payment)))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/invoice/{invoiceId}")
    public ResponseEntity<List<PaymentDto>> listPaymentsForInvoice(@PathVariable UUID invoiceId) {
        ListPaymentsQuery query = new ListPaymentsQuery(invoiceId);
        List<PaymentDto> payments = listPaymentsQueryHandler.handle(query).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(payments);
    }
    
    private PaymentDto toDto(Payment payment) {
        return new PaymentDto(
                payment.getId(),
                payment.getInvoiceId(),
                payment.getAmount(),
                payment.getPaymentDate(),
                payment.getCreatedAt()
        );
    }
}

