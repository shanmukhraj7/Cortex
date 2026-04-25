package com.cortex.notes.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtContextFilter extends OncePerRequestFilter {

    private static final ThreadLocal<String> currentUser = new ThreadLocal<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String userId = request.getHeader("X-User-Id");
        if (userId != null && !userId.isBlank()) {
            currentUser.set(userId);
        }
        try {
            filterChain.doFilter(request, response);
        } finally {
            currentUser.remove();
        }
    }

    public static String getCurrentUserId() {
        return currentUser.get();
    }
}
