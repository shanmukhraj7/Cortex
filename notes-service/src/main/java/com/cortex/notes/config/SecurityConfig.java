package com.cortex.notes.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import com.cortex.notes.security.JwtContextFilter;

/**
 * Spring Security is permissive here — the api-gateway already
 * validated the JWT before routing the request to this service.
 * Our JwtContextFilter enforces the X-User-Id header is present
 * on every protected endpoint.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtContextFilter jwtContextFilter;

    public SecurityConfig(JwtContextFilter jwtContextFilter) {
        this.jwtContextFilter = jwtContextFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(s ->
                s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth.anyRequest().permitAll())
            .addFilterBefore(jwtContextFilter,
                UsernamePasswordAuthenticationFilter.class)
            .build();
    }
}