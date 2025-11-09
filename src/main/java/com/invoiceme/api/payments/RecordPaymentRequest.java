package com.invoiceme.api.payments;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public class RecordPaymentRequest {
    @NotNull(message = "Invoice ID is required")
    private UUID invoiceId;
    
    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be greater than zero")
    private BigDecimal amount;
    
    @NotNull(message = "Payment date is required")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss", shape = JsonFormat.Shape.STRING)
    private LocalDateTime paymentDate;
    
    public RecordPaymentRequest() {}
    
    public RecordPaymentRequest(UUID invoiceId, BigDecimal amount, LocalDateTime paymentDate) {
        this.invoiceId = invoiceId;
        this.amount = amount;
        this.paymentDate = paymentDate;
    }
    
    public UUID getInvoiceId() {
        return invoiceId;
    }
    
    public void setInvoiceId(UUID invoiceId) {
        this.invoiceId = invoiceId;
    }
    
    public BigDecimal getAmount() {
        return amount;
    }
    
    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
    
    public LocalDateTime getPaymentDate() {
        return paymentDate;
    }
    
    public void setPaymentDate(LocalDateTime paymentDate) {
        this.paymentDate = paymentDate;
    }
}

