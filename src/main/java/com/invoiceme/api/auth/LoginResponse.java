package com.invoiceme.api.auth;

public record LoginResponse(
    String token,
    String email
) {}


