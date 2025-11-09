package com.invoiceme.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.invoiceme.api.auth.LoginRequest;
import com.invoiceme.api.auth.LoginResponse;
import com.invoiceme.api.customers.CreateCustomerRequest;
import com.invoiceme.api.invoices.AddLineItemRequest;
import com.invoiceme.api.invoices.CreateInvoiceRequest;
import com.invoiceme.api.invoices.InvoiceDto;
import com.invoiceme.api.payments.PaymentDto;
import com.invoiceme.api.payments.RecordPaymentRequest;
import com.invoiceme.domain.customer.Customer;
import com.invoiceme.domain.invoice.InvoiceStatus;
import com.invoiceme.domain.user.User;
import com.invoiceme.infrastructure.persistence.customer.CustomerRepository;
import com.invoiceme.infrastructure.persistence.invoice.InvoiceRepository;
import com.invoiceme.infrastructure.persistence.payment.PaymentRepository;
import com.invoiceme.infrastructure.persistence.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@DisplayName("Customer → Invoice → Payment Flow Integration Test")
class CustomerInvoicePaymentFlowTest {
    
    @LocalServerPort
    private int port;
    
    @Autowired
    private TestRestTemplate restTemplate;
    
    @Autowired
    private CustomerRepository customerRepository;
    
    @Autowired
    private InvoiceRepository invoiceRepository;
    
    @Autowired
    private PaymentRepository paymentRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    private String baseUrl;
    private String authToken;
    private HttpHeaders headers;
    
    @BeforeEach
    void setUp() {
        baseUrl = "http://localhost:" + port;
        
        // Clean up test data
        paymentRepository.deleteAll();
        invoiceRepository.deleteAll();
        customerRepository.deleteAll();
        userRepository.deleteAll();
        
        // Create test user
        User testUser = new User("test@example.com", passwordEncoder.encode("password123"));
        userRepository.save(testUser);
        
        // Login to get auth token
        LoginRequest loginRequest = new LoginRequest("test@example.com", "password123");
        ResponseEntity<LoginResponse> loginResponse = restTemplate.postForEntity(
                baseUrl + "/api/auth/login",
                loginRequest,
                LoginResponse.class
        );
        
        assertEquals(HttpStatus.OK, loginResponse.getStatusCode());
        assertNotNull(loginResponse.getBody());
        authToken = loginResponse.getBody().token();
        assertNotNull(authToken);
        
        // Set up headers with auth token
        headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(authToken);
    }
    
    @Test
    @DisplayName("Complete business flow: Create customer → Create invoice → Add line items → Send invoice → Record payment → Verify Paid state")
    void testCompleteBusinessFlow() {
        // Step 1: Create customer
        CreateCustomerRequest createCustomerRequest = new CreateCustomerRequest("Test Customer", "customer@example.com");
        HttpEntity<CreateCustomerRequest> customerRequest = new HttpEntity<>(createCustomerRequest, headers);
        
        ResponseEntity<Customer> customerResponse = restTemplate.exchange(
                baseUrl + "/api/customers",
                HttpMethod.POST,
                customerRequest,
                Customer.class
        );
        
        assertEquals(HttpStatus.CREATED, customerResponse.getStatusCode());
        assertNotNull(customerResponse.getBody());
        UUID customerId = customerResponse.getBody().getId();
        assertNotNull(customerId);
        
        // Step 2: Create invoice in Draft state
        CreateInvoiceRequest createInvoiceRequest = new CreateInvoiceRequest(customerId);
        HttpEntity<CreateInvoiceRequest> invoiceRequest = new HttpEntity<>(createInvoiceRequest, headers);
        
        ResponseEntity<InvoiceDto> invoiceResponse = restTemplate.exchange(
                baseUrl + "/api/invoices",
                HttpMethod.POST,
                invoiceRequest,
                InvoiceDto.class
        );
        
        assertEquals(HttpStatus.CREATED, invoiceResponse.getStatusCode());
        assertNotNull(invoiceResponse.getBody());
        UUID invoiceId = invoiceResponse.getBody().getId();
        assertEquals(InvoiceStatus.DRAFT, invoiceResponse.getBody().getStatus());
        assertEquals(BigDecimal.ZERO, invoiceResponse.getBody().getBalance());
        
        // Step 3: Add line items
        AddLineItemRequest lineItem1 = new AddLineItemRequest("Item 1", 2, new BigDecimal("10.00"));
        HttpEntity<AddLineItemRequest> lineItemRequest1 = new HttpEntity<>(lineItem1, headers);
        
        ResponseEntity<InvoiceDto> invoiceWithItem1 = restTemplate.exchange(
                baseUrl + "/api/invoices/" + invoiceId + "/items",
                HttpMethod.POST,
                lineItemRequest1,
                InvoiceDto.class
        );
        
        assertEquals(HttpStatus.OK, invoiceWithItem1.getStatusCode());
        assertNotNull(invoiceWithItem1.getBody());
        assertEquals(new BigDecimal("20.00"), invoiceWithItem1.getBody().getBalance());
        assertEquals(1, invoiceWithItem1.getBody().getLineItems().size());
        
        AddLineItemRequest lineItem2 = new AddLineItemRequest("Item 2", 3, new BigDecimal("15.00"));
        HttpEntity<AddLineItemRequest> lineItemRequest2 = new HttpEntity<>(lineItem2, headers);
        
        ResponseEntity<InvoiceDto> invoiceWithItem2 = restTemplate.exchange(
                baseUrl + "/api/invoices/" + invoiceId + "/items",
                HttpMethod.POST,
                lineItemRequest2,
                InvoiceDto.class
        );
        
        assertEquals(HttpStatus.OK, invoiceWithItem2.getStatusCode());
        assertNotNull(invoiceWithItem2.getBody());
        // Total: 20.00 + 45.00 = 65.00
        assertEquals(new BigDecimal("65.00"), invoiceWithItem2.getBody().getBalance());
        assertEquals(2, invoiceWithItem2.getBody().getLineItems().size());
        
        // Step 4: Mark invoice as Sent
        HttpEntity<Void> sendRequest = new HttpEntity<>(headers);
        
        ResponseEntity<InvoiceDto> sentInvoice = restTemplate.exchange(
                baseUrl + "/api/invoices/" + invoiceId + "/send",
                HttpMethod.POST,
                sendRequest,
                InvoiceDto.class
        );
        
        assertEquals(HttpStatus.OK, sentInvoice.getStatusCode());
        assertNotNull(sentInvoice.getBody());
        assertEquals(InvoiceStatus.SENT, sentInvoice.getBody().getStatus());
        assertEquals(new BigDecimal("65.00"), sentInvoice.getBody().getBalance());
        
        // Step 5: Verify invoice cannot be updated after being sent
        CreateInvoiceRequest updateRequest = new CreateInvoiceRequest(customerId);
        HttpEntity<CreateInvoiceRequest> updateEntity = new HttpEntity<>(updateRequest, headers);
        
        ResponseEntity<String> updateResponse = restTemplate.exchange(
                baseUrl + "/api/invoices/" + invoiceId,
                HttpMethod.PUT,
                updateEntity,
                String.class
        );
        
        assertEquals(HttpStatus.BAD_REQUEST, updateResponse.getStatusCode());
        
        // Step 6: Record payment for full invoice amount
        RecordPaymentRequest paymentRequest = new RecordPaymentRequest(invoiceId, new BigDecimal("65.00"), LocalDateTime.now());
        HttpEntity<RecordPaymentRequest> paymentEntity = new HttpEntity<>(paymentRequest, headers);
        
        ResponseEntity<PaymentDto> paymentResponse = restTemplate.exchange(
                baseUrl + "/api/payments",
                HttpMethod.POST,
                paymentEntity,
                PaymentDto.class
        );
        
        assertEquals(HttpStatus.CREATED, paymentResponse.getStatusCode());
        assertNotNull(paymentResponse.getBody());
        assertEquals(new BigDecimal("65.00"), paymentResponse.getBody().getAmount());
        
        // Step 7: Verify invoice transitions to Paid state and balance is zero
        ResponseEntity<InvoiceDto> paidInvoice = restTemplate.exchange(
                baseUrl + "/api/invoices/" + invoiceId,
                HttpMethod.GET,
                new HttpEntity<>(headers),
                InvoiceDto.class
        );
        
        assertEquals(HttpStatus.OK, paidInvoice.getStatusCode());
        assertNotNull(paidInvoice.getBody());
        assertEquals(InvoiceStatus.PAID, paidInvoice.getBody().getStatus());
        assertEquals(0, paidInvoice.getBody().getBalance().compareTo(BigDecimal.ZERO));
    }
    
    @Test
    @DisplayName("Verify state transitions are enforced: Draft → Sent → Paid, invalid transitions rejected")
    void testStateTransitionsEnforced() {
        // Create customer and invoice
        CreateCustomerRequest createCustomerRequest = new CreateCustomerRequest("Test Customer", "customer@example.com");
        HttpEntity<CreateCustomerRequest> customerRequest = new HttpEntity<>(createCustomerRequest, headers);
        
        ResponseEntity<Customer> customerResponse = restTemplate.exchange(
                baseUrl + "/api/customers",
                HttpMethod.POST,
                customerRequest,
                Customer.class
        );
        
        UUID customerId = customerResponse.getBody().getId();
        
        CreateInvoiceRequest createInvoiceRequest = new CreateInvoiceRequest(customerId);
        HttpEntity<CreateInvoiceRequest> invoiceRequest = new HttpEntity<>(createInvoiceRequest, headers);
        
        ResponseEntity<InvoiceDto> invoiceResponse = restTemplate.exchange(
                baseUrl + "/api/invoices",
                HttpMethod.POST,
                invoiceRequest,
                InvoiceDto.class
        );
        
        UUID invoiceId = invoiceResponse.getBody().getId();
        
        // Verify Draft state
        assertEquals(InvoiceStatus.DRAFT, invoiceResponse.getBody().getStatus());
        
        // Add line item while in Draft state
        AddLineItemRequest lineItem = new AddLineItemRequest("Item", 1, new BigDecimal("10.00"));
        HttpEntity<AddLineItemRequest> lineItemRequest = new HttpEntity<>(lineItem, headers);
        restTemplate.exchange(
                baseUrl + "/api/invoices/" + invoiceId + "/items",
                HttpMethod.POST,
                lineItemRequest,
                InvoiceDto.class
        );
        
        // Transition to Sent
        HttpEntity<Void> sendRequest = new HttpEntity<>(headers);
        ResponseEntity<InvoiceDto> sentInvoice = restTemplate.exchange(
                baseUrl + "/api/invoices/" + invoiceId + "/send",
                HttpMethod.POST,
                sendRequest,
                InvoiceDto.class
        );
        
        assertEquals(InvoiceStatus.SENT, sentInvoice.getBody().getStatus());
        
        // Try to send again (invalid transition)
        ResponseEntity<String> invalidSend = restTemplate.exchange(
                baseUrl + "/api/invoices/" + invoiceId + "/send",
                HttpMethod.POST,
                sendRequest,
                String.class
        );
        
        assertEquals(HttpStatus.BAD_REQUEST, invalidSend.getStatusCode());
        
        // Record payment to transition to Paid
        RecordPaymentRequest paymentRequest = new RecordPaymentRequest(invoiceId, new BigDecimal("10.00"), LocalDateTime.now());
        HttpEntity<RecordPaymentRequest> paymentEntity = new HttpEntity<>(paymentRequest, headers);
        restTemplate.exchange(
                baseUrl + "/api/payments",
                HttpMethod.POST,
                paymentEntity,
                PaymentDto.class
        );
        
        // Verify Paid state
        ResponseEntity<InvoiceDto> paidInvoice = restTemplate.exchange(
                baseUrl + "/api/invoices/" + invoiceId,
                HttpMethod.GET,
                new HttpEntity<>(headers),
                InvoiceDto.class
        );
        
        assertEquals(InvoiceStatus.PAID, paidInvoice.getBody().getStatus());
    }
    
    @Test
    @DisplayName("Verify balance calculations are accurate when line items are added and payments are applied")
    void testBalanceCalculations() {
        // Create customer and invoice
        CreateCustomerRequest createCustomerRequest = new CreateCustomerRequest("Test Customer", "customer@example.com");
        HttpEntity<CreateCustomerRequest> customerRequest = new HttpEntity<>(createCustomerRequest, headers);
        
        ResponseEntity<Customer> customerResponse = restTemplate.exchange(
                baseUrl + "/api/customers",
                HttpMethod.POST,
                customerRequest,
                Customer.class
        );
        
        UUID customerId = customerResponse.getBody().getId();
        
        CreateInvoiceRequest createInvoiceRequest = new CreateInvoiceRequest(customerId);
        HttpEntity<CreateInvoiceRequest> invoiceRequest = new HttpEntity<>(createInvoiceRequest, headers);
        
        ResponseEntity<InvoiceDto> invoiceResponse = restTemplate.exchange(
                baseUrl + "/api/invoices",
                HttpMethod.POST,
                invoiceRequest,
                InvoiceDto.class
        );
        
        UUID invoiceId = invoiceResponse.getBody().getId();
        
        // Initial balance should be zero
        assertEquals(BigDecimal.ZERO, invoiceResponse.getBody().getBalance());
        
        // Add first line item: 2 × 10.00 = 20.00
        AddLineItemRequest lineItem1 = new AddLineItemRequest("Item 1", 2, new BigDecimal("10.00"));
        HttpEntity<AddLineItemRequest> lineItemRequest1 = new HttpEntity<>(lineItem1, headers);
        
        ResponseEntity<InvoiceDto> invoice1 = restTemplate.exchange(
                baseUrl + "/api/invoices/" + invoiceId + "/items",
                HttpMethod.POST,
                lineItemRequest1,
                InvoiceDto.class
        );
        
        assertEquals(new BigDecimal("20.00"), invoice1.getBody().getBalance());
        
        // Add second line item: 3 × 15.00 = 45.00, total = 65.00
        AddLineItemRequest lineItem2 = new AddLineItemRequest("Item 2", 3, new BigDecimal("15.00"));
        HttpEntity<AddLineItemRequest> lineItemRequest2 = new HttpEntity<>(lineItem2, headers);
        
        ResponseEntity<InvoiceDto> invoice2 = restTemplate.exchange(
                baseUrl + "/api/invoices/" + invoiceId + "/items",
                HttpMethod.POST,
                lineItemRequest2,
                InvoiceDto.class
        );
        
        assertEquals(new BigDecimal("65.00"), invoice2.getBody().getBalance());
        
        // Send invoice
        HttpEntity<Void> sendRequest = new HttpEntity<>(headers);
        restTemplate.exchange(
                baseUrl + "/api/invoices/" + invoiceId + "/send",
                HttpMethod.POST,
                sendRequest,
                InvoiceDto.class
        );
        
        // Record partial payment: 30.00
        RecordPaymentRequest payment1 = new RecordPaymentRequest(invoiceId, new BigDecimal("30.00"), LocalDateTime.now());
        HttpEntity<RecordPaymentRequest> paymentEntity1 = new HttpEntity<>(payment1, headers);
        
        restTemplate.exchange(
                baseUrl + "/api/payments",
                HttpMethod.POST,
                paymentEntity1,
                PaymentDto.class
        );
        
        // Verify balance: 65.00 - 30.00 = 35.00
        ResponseEntity<InvoiceDto> invoiceAfterPayment1 = restTemplate.exchange(
                baseUrl + "/api/invoices/" + invoiceId,
                HttpMethod.GET,
                new HttpEntity<>(headers),
                InvoiceDto.class
        );
        
        assertEquals(new BigDecimal("35.00"), invoiceAfterPayment1.getBody().getBalance());
        
        // Record remaining payment: 35.00
        RecordPaymentRequest payment2 = new RecordPaymentRequest(invoiceId, new BigDecimal("35.00"), LocalDateTime.now());
        HttpEntity<RecordPaymentRequest> paymentEntity2 = new HttpEntity<>(payment2, headers);
        
        restTemplate.exchange(
                baseUrl + "/api/payments",
                HttpMethod.POST,
                paymentEntity2,
                PaymentDto.class
        );
        
        // Verify balance is zero and status is Paid
        ResponseEntity<InvoiceDto> finalInvoice = restTemplate.exchange(
                baseUrl + "/api/invoices/" + invoiceId,
                HttpMethod.GET,
                new HttpEntity<>(headers),
                InvoiceDto.class
        );
        
        assertEquals(0, finalInvoice.getBody().getBalance().compareTo(BigDecimal.ZERO));
        assertEquals(InvoiceStatus.PAID, finalInvoice.getBody().getStatus());
    }
}

