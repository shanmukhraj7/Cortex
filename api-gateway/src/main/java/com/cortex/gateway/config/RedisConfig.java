package com.cortex.gateway.config;

import com.cortex.gateway.RateLimitFilter;
import io.lettuce.core.RedisClient;
import io.lettuce.core.RedisURI;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Provides the Lettuce {@link RedisClient} consumed by
 * {@link RateLimitFilter}.
 *
 * <p>Spring Boot auto-configures a {@code ReactiveRedisConnectionFactory}
 * for Spring Data Redis, but Bucket4j's {@code LettuceBasedProxyManager}
 * requires a raw Lettuce client rather than a Spring-managed factory.
 * Creating it here lets both share the same {@code REDIS_URL} without
 * duplication.
 *
 * <p>{@code destroyMethod = "shutdown"} ensures the client and its
 * underlying thread pools are released cleanly on application stop.
 */
@Configuration
public class RedisConfig {

    @Bean(destroyMethod = "shutdown")
    public RedisClient lettuceRedisClient(
            @Value("${spring.data.redis.url:redis://localhost:6379}") String redisUrl) {
        return RedisClient.create(RedisURI.create(redisUrl));
    }
}