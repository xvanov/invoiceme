package com.invoiceme.api.auth;

import com.invoiceme.domain.user.User;
import com.invoiceme.infrastructure.persistence.user.UserRepository;
import com.invoiceme.infrastructure.security.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    
    public AuthController(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElse(null);
        
        if (user == null || !passwordEncoder.matches(request.password(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse("Invalid email or password"));
        }
        
        String token = jwtUtil.generateToken(user.getEmail());
        return ResponseEntity.ok(new LoginResponse(token, user.getEmail()));
    }
    
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        // Check if user already exists
        if (userRepository.findByEmail(request.email()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new ErrorResponse("User with this email already exists"));
        }
        
        // Create new user with hashed password
        String hashedPassword = passwordEncoder.encode(request.password());
        User newUser = new User(request.email(), hashedPassword);
        User savedUser = userRepository.save(newUser);
        
        // Generate token and return
        String token = jwtUtil.generateToken(savedUser.getEmail());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new LoginResponse(token, savedUser.getEmail()));
    }
    
    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        // With JWT, logout is handled client-side by removing the token
        // No server-side session to invalidate
        return ResponseEntity.ok().build();
    }
    
    // Helper class for error responses
    private record ErrorResponse(String message) {}
}

