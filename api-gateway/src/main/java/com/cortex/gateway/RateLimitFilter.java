package com.cortex.gateway;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.BucketConfiguration;
import io.github.bucket4j.redis.lettuce.cas.LettuceBasedProxyManager;

import io.lettuce.core.RedisClient;
import io.lettuce.core.api.StatefulRedisConnection;
import io.lettuce.core.codec.ByteArrayCodec;
import io.lettuce.core.codec.RedisCodec;
import io.lettuce.core.codec.StringCodec;

import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;

import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.function.Supplier;

/**
 * Token-bucket rate limiter backed by Redis via Bucket4j + Lettuce.
 *
 * <p>Each unique key (IP address or X-User-Id header) gets its own bucket:
 * 100 tokens refilled at 100 tokens/minute. Requests that exceed the limit
 * receive HTTP 429 Too Many Requests immediately, without forwarding to
 * downstream services.
 *
 * <p>Order {@code -90} places this filter after {@link JwtAuthFilter}
 * (order {@code -100}), so rate-limit buckets for authenticated routes are
 * keyed on the real user ID rather than the originating IP.
 */
@Component
public class RateLimitFilter implements GlobalFilter, Ordered {

    private static final int CAPACITY = 100;
    private static final Duration REFILL_PERIOD = Duration.ofMinutes(1);

    private final LettuceBasedProxyManager<String> proxyManager;
    private final Supplier<BucketConfiguration> bucketConfig;

    public RateLimitFilter(RedisClient lettuceRedisClient) {
        StatefulRedisConnection<String, byte[]> connection =
                lettuceRedisClient.connect(RedisCodec.of(StringCodec.UTF8, ByteArrayCodec.INSTANCE));

        this.proxyManager = LettuceBasedProxyManager.builderFor(connection)
                .build();

        this.bucketConfig = () -> BucketConfiguration.builder()
                .addLimit(Bandwidth.builder()
                        .capacity(CAPACITY)
                        .refillGreedy(CAPACITY, REFILL_PERIOD)
                        .build())
                .build();
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String key = resolveKey(exchange);

        var bucket = proxyManager.builder().build(key, bucketConfig);

        if (bucket.tryConsume(1)) {
            return chain.filter(exchange);
        }

        exchange.getResponse().setStatusCode(HttpStatus.TOO_MANY_REQUESTS);
        exchange.getResponse().getHeaders().add("X-RateLimit-Retry-After", "60");
        return exchange.getResponse().setComplete();
    }

    /**
     * Key priority:
     * 1. X-User-Id (set by JwtAuthFilter for authenticated requests)
     * 2. X-Forwarded-For (real IP behind a proxy / load balancer)
     * 3. Remote address (direct connection)
     */
    private String resolveKey(ServerWebExchange exchange) {
        String userId = exchange.getRequest().getHeaders().getFirst("X-User-Id");
        if (userId != null && !userId.isBlank()) {
            return "rl:user:" + userId;
        }
        String forwarded = exchange.getRequest().getHeaders().getFirst("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return "rl:ip:" + forwarded.split(",")[0].trim();
        }
        var remoteAddress = exchange.getRequest().getRemoteAddress();
        String ip = remoteAddress != null ? remoteAddress.getAddress().getHostAddress() : "unknown";
        return "rl:ip:" + ip;
    }

    @Override
    public int getOrder() {
        return -90;
    }
}