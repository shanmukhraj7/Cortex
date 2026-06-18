package com.cortex.gateway.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayConfig {

    @Bean
    public RouteLocator routes(
            RouteLocatorBuilder builder,
            @Value("${cortex.services.auth-url}")     String authUrl,
            @Value("${cortex.services.notes-url}")     String notesUrl,
            @Value("${cortex.services.settings-url}") String settingsUrl
    ) {
        return builder.routes()
                // Auth routes — public, no JWT required (enforced in JwtAuthFilter)
                .route("auth-root", r -> r.path("/auth").uri(authUrl))
                .route("auth-sub",  r -> r.path("/auth/**").uri(authUrl))
                // Notes routes — JWT required
                .route("notes-root", r -> r.path("/notes").uri(notesUrl))
                .route("notes-sub",  r -> r.path("/notes/**").uri(notesUrl))
                // Search route — JWT required
                .route("search-root", r -> r.path("/search").uri(notesUrl))
                .route("search-sub",  r -> r.path("/search/**").uri(notesUrl))
                // Settings routes — JWT required
                .route("settings-root", r -> r.path("/settings").uri(settingsUrl))
                .route("settings-sub",  r -> r.path("/settings/**").uri(settingsUrl))
                .build();
    }
}