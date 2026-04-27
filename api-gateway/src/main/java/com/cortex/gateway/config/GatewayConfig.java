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
            @Value("${cortex.services.auth-url}") String authUrl,
            @Value("${cortex.services.notes-url}") String notesUrl
    ) {
        return builder.routes()
                .route("auth", r -> r.path("/auth/**").uri(authUrl))
                .route("notes", r -> r.path("/notes/**").uri(notesUrl))
                .route("search", r -> r.path("/search").uri(notesUrl))
                .build();
    }
}
