package com.cortex.auth.controller;

import com.cortex.auth.service.AuthService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/auth/register")
    @ResponseStatus(HttpStatus.CREATED)
    public void register(@Valid @RequestBody AuthRequest request) {
        authService.register(request.email(), request.password());
    }

    @PostMapping("/auth/login")
    public TokenResponse login(@Valid @RequestBody AuthRequest request) {
        return new TokenResponse(authService.login(request.email(), request.password()), "Bearer");
    }

    public record AuthRequest(
            @Email @NotBlank String email,
            @NotBlank @Size(min = 8, max = 128) String password
    ) {
    }

    public record TokenResponse(String access_token, String token_type) {
    }
}
