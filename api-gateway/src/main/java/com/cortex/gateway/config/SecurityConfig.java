package com.cortex.gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;

/**
 * Reactive Spring Security configuration for the API Gateway.
 *
 * <p>JWT validation and user-identity forwarding are handled entirely by
 * {@link com.cortex.gateway.filter.JwtAuthFilter} at order {@code -100}.
 * Spring Security is configured here to disable its own authentication
 * machinery so the two subsystems don't interfere.
 *
 * <p>All access-control decisions are made in the filter chain, not here.
 */
@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {
        return http
                // Stateless JSON API — no CSRF surface.
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                // No HTML forms or browser-initiated Basic auth.
                .httpBasic(ServerHttpSecurity.HttpBasicSpec::disable)
                .formLogin(ServerHttpSecurity.FormLoginSpec::disable)
                // Permit everything at the Spring Security layer;
                // JwtAuthFilter enforces authentication on protected routes.
                .authorizeExchange(exchanges -> exchanges.anyExchange().permitAll())
                .build();
    }
}