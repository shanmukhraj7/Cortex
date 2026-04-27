package com.cortex.notes.config;

import io.github.resilience4j.circuitbreaker.CircuitBreakerConfig;
import io.github.resilience4j.circuitbreaker.CircuitBreakerRegistry;
import io.github.resilience4j.timelimiter.TimeLimiterConfig;
import java.time.Duration;
import org.springframework.cloud.circuitbreaker.resilience4j.Resilience4JCircuitBreakerFactory;
import org.springframework.cloud.circuitbreaker.resilience4j.Resilience4JConfigBuilder;
import org.springframework.cloud.client.circuitbreaker.Customizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ResilienceConfig {

    /**
     * Default circuit breaker settings applied to all breakers created via
     * {@link Resilience4JCircuitBreakerFactory}.
     *
     * <p>Tuned for the ML service:
     * <ul>
     *   <li>Open after 50 % failures in a 10-call sliding window</li>
     *   <li>Stay open for 30 s before trying a single probe call</li>
     *   <li>Time-limit each call at 10 s (embed) / 15 s (search) — see per-id customisation below</li>
     * </ul>
     */
    @Bean
    public Customizer<Resilience4JCircuitBreakerFactory> defaultCircuitBreakerCustomizer() {
        CircuitBreakerConfig cbConfig = CircuitBreakerConfig.custom()
                .slidingWindowType(CircuitBreakerConfig.SlidingWindowType.COUNT_BASED)
                .slidingWindowSize(10)
                .failureRateThreshold(50f)
                .waitDurationInOpenState(Duration.ofSeconds(30))
                .permittedNumberOfCallsInHalfOpenState(2)
                .slowCallDurationThreshold(Duration.ofSeconds(8))
                .slowCallRateThreshold(80f)
                .recordExceptions(Exception.class)
                .build();

        TimeLimiterConfig tlConfig = TimeLimiterConfig.custom()
                .timeoutDuration(Duration.ofSeconds(10))
                .build();

        return factory -> factory.configureDefault(id ->
                new Resilience4JConfigBuilder(id)
                        .circuitBreakerConfig(cbConfig)
                        .timeLimiterConfig(tlConfig)
                        .build());
    }

    /**
     * Longer timeout for the two-stage search call which may take up to 15 s on
     * CPU-only Railway deployments.
     */
    @Bean
    public Customizer<Resilience4JCircuitBreakerFactory> mlSearchCircuitBreakerCustomizer() {
        TimeLimiterConfig searchTl = TimeLimiterConfig.custom()
                .timeoutDuration(Duration.ofSeconds(15))
                .build();

        return factory -> factory.configure(
                builder -> builder.timeLimiterConfig(searchTl),
                "ml-search");
    }

    /**
     * Expose the registry so it can be injected and inspected in tests / actuator.
     */
    @Bean
    public CircuitBreakerRegistry circuitBreakerRegistry() {
        return CircuitBreakerRegistry.ofDefaults();
    }
}