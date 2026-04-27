package com.cortex.notes.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

/**
 * Reads the trusted X-User-Id header forwarded by the api-gateway.
 *
 * Security model (read carefully):
 *
 *   Step 1 — api-gateway receives request with Bearer JWT from browser.
 *   Step 2 — gateway validates JWT signature + expiry using JWT_SECRET.
 *   Step 3 — gateway STRIPS any X-User-Id the client sent (prevents spoofing).
 *   Step 4 — gateway adds its own X-User-Id from the verified JWT "sub" claim.
 *   Step 5 — gateway routes request to this service.
 *   Step 6 — this filter reads X-User-Id and populates UserContext.
 *
 *   A missing X-User-Id means the request bypassed the gateway
 *   (misconfiguration or a bypass attempt). Return HTTP 401 immediately.
 *   A malformed UUID in the header is also rejected.
 *
 *   UserContext.clear() is called in finally — thread-local is never leaked.
 */
@Component
public class JwtContextFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtContextFilter.class);
    private static final String HEADER = "X-User-Id";

    private static final String[] PUBLIC = {
        "/actuator/health",
        "/actuator/info",
        "/v3/api-docs",
        "/swagger-ui",
    };

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest  req,
            @NonNull HttpServletResponse res,
            @NonNull FilterChain         chain
    ) throws ServletException, IOException {

        String path = req.getRequestURI();
        for (String pub : PUBLIC) {
            if (path.startsWith(pub)) { chain.doFilter(req, res); return; }
        }

        String raw = req.getHeader(HEADER);
        if (raw == null || raw.isBlank()) {
            log.warn("Missing {} header on path '{}'", HEADER, path);
            reject(res, "Missing authentication context");
            return;
        }

        try {
            UserContext.set(UUID.fromString(raw.trim()));
            chain.doFilter(req, res);
        } catch (IllegalArgumentException e) {
            log.warn("Malformed {} header '{}' on path '{}'", HEADER, raw, path);
            reject(res, "Malformed user identity");
        } finally {
            UserContext.clear();
        }
    }

    private void reject(HttpServletResponse res, String msg) throws IOException {
        res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        res.setContentType("application/json");
        res.getWriter().write(
            "{\"status\":401,\"error\":\"Unauthorized\",\"message\":\"" + msg + "\"}"
        );
    }
}