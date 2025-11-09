package com.invoiceme.api.invoices;

import com.invoiceme.application.commands.invoice.*;
import com.invoiceme.application.queries.invoice.*;
import com.invoiceme.domain.invoice.Invoice;
import com.invoiceme.domain.invoice.InvoiceLineItem;
import com.invoiceme.domain.invoice.InvoiceStatus;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/invoices")
public class InvoiceController {
    private final CreateInvoiceCommandHandler createInvoiceCommandHandler;
    private final AddLineItemCommandHandler addLineItemCommandHandler;
    private final UpdateInvoiceCommandHandler updateInvoiceCommandHandler;
    private final SendInvoiceCommandHandler sendInvoiceCommandHandler;
    private final GetInvoiceQueryHandler getInvoiceQueryHandler;
    private final ListInvoicesQueryHandler listInvoicesQueryHandler;
    
    public InvoiceController(
            CreateInvoiceCommandHandler createInvoiceCommandHandler,
            AddLineItemCommandHandler addLineItemCommandHandler,
            UpdateInvoiceCommandHandler updateInvoiceCommandHandler,
            SendInvoiceCommandHandler sendInvoiceCommandHandler,
            GetInvoiceQueryHandler getInvoiceQueryHandler,
            ListInvoicesQueryHandler listInvoicesQueryHandler) {
        this.createInvoiceCommandHandler = createInvoiceCommandHandler;
        this.addLineItemCommandHandler = addLineItemCommandHandler;
        this.updateInvoiceCommandHandler = updateInvoiceCommandHandler;
        this.sendInvoiceCommandHandler = sendInvoiceCommandHandler;
        this.getInvoiceQueryHandler = getInvoiceQueryHandler;
        this.listInvoicesQueryHandler = listInvoicesQueryHandler;
    }
    
    @PostMapping
    public ResponseEntity<InvoiceDto> createInvoice(@Valid @RequestBody CreateInvoiceRequest request) {
        CreateInvoiceCommand command = new CreateInvoiceCommand(request.getCustomerId());
        Invoice saved = createInvoiceCommandHandler.handle(command);
        
        InvoiceDto dto = toDto(saved);
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<InvoiceDto> getInvoice(@PathVariable UUID id) {
        GetInvoiceQuery query = new GetInvoiceQuery(id);
        return getInvoiceQueryHandler.handle(query)
                .map(invoice -> ResponseEntity.ok(toDto(invoice)))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping
    public ResponseEntity<List<InvoiceDto>> listInvoices(
            @RequestParam(required = false) UUID customerId,
            @RequestParam(required = false) InvoiceStatus status) {
        ListInvoicesQuery query = new ListInvoicesQuery(
                customerId != null ? java.util.Optional.of(customerId) : java.util.Optional.empty(),
                status != null ? java.util.Optional.of(status) : java.util.Optional.empty()
        );
        List<InvoiceDto> invoices = listInvoicesQueryHandler.handle(query).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(invoices);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<InvoiceDto> updateInvoice(
            @PathVariable UUID id,
            @Valid @RequestBody CreateInvoiceRequest request) {
        UpdateInvoiceCommand command = new UpdateInvoiceCommand(id, request.getCustomerId());
        Invoice updated = updateInvoiceCommandHandler.handle(command);
        InvoiceDto dto = toDto(updated);
        return ResponseEntity.ok(dto);
    }
    
    @PostMapping("/{id}/send")
    public ResponseEntity<InvoiceDto> sendInvoice(@PathVariable UUID id) {
        SendInvoiceCommand command = new SendInvoiceCommand(id);
        Invoice sent = sendInvoiceCommandHandler.handle(command);
        InvoiceDto dto = toDto(sent);
        return ResponseEntity.ok(dto);
    }
    
    @PostMapping("/{id}/items")
    public ResponseEntity<InvoiceDto> addLineItem(
            @PathVariable UUID id,
            @Valid @RequestBody AddLineItemRequest request) {
        AddLineItemCommand command = new AddLineItemCommand(
                id,
                request.getDescription(),
                request.getQuantity(),
                request.getUnitPrice()
        );
        Invoice updated = addLineItemCommandHandler.handle(command);
        InvoiceDto dto = toDto(updated);
        return ResponseEntity.ok(dto);
    }
    
    private InvoiceDto toDto(Invoice invoice) {
        List<InvoiceLineItemDto> lineItemDtos = invoice.getLineItems().stream()
                .map(this::toLineItemDto)
                .collect(Collectors.toList());
        
        return new InvoiceDto(
                invoice.getId(),
                invoice.getCustomerId(),
                invoice.getStatus(),
                lineItemDtos,
                invoice.getBalance(),
                invoice.getCreatedAt(),
                invoice.getUpdatedAt()
        );
    }
    
    private InvoiceLineItemDto toLineItemDto(InvoiceLineItem lineItem) {
        return new InvoiceLineItemDto(
                lineItem.getLineItemId(),
                lineItem.getDescription(),
                lineItem.getQuantity(),
                lineItem.getUnitPrice(),
                lineItem.getSubtotal()
        );
    }
}

