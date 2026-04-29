package com.cortex.notes.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * CORS is handled centrally by the api-gateway's CorsWebFilter.
 *
 * <p>This service does NOT add its own CORS headers because:
 * <ul>
 *   <li>The gateway already sets Access-Control-Allow-Origin.</li>
 *   <li>Adding a second CORS filter here produces duplicate headers,
 *       causing browsers to reject the response with:
 *       "The 'Access-Control-Allow-Origin' header contains multiple values".</li>
 *   <li>In production, this service is never reachable from the public internet
 *       — only the gateway is exposed.</li>
 * </ul>
 *
 * <p>For local development without the gateway, enable CORS by uncommenting
 * the {@code addCorsMappings} override below.
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    // Uncomment for standalone dev (no api-gateway):
    // @Override
    // public void addCorsMappings(CorsRegistry registry) {
    //     registry.addMapping("/**")
    //             .allowedOriginPatterns("http://localhost:*")
    //             .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
    //             .allowedHeaders("*")
    //             .allowCredentials(true);
    // }
}