package com.cortex.notes.security;

import java.util.UUID;

/**
 * Thread-local store for the authenticated user's ID.
 * Populated by JwtContextFilter from the trusted X-User-Id header.
 * Cleared in the filter's finally block to prevent leaks.
 */
public final class UserContext {

    private static final ThreadLocal<UUID> CURRENT = new ThreadLocal<>();

    private UserContext() {}

    public static void set(UUID userId) {
        CURRENT.set(userId);
    }

    public static UUID get() {
        return CURRENT.get();
    }

    public static void clear() {
        CURRENT.remove();
    }
}
