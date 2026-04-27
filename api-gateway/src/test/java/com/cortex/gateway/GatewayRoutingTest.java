package com.cortex.gateway;

import com.github.tomakehurst.wiremock.WireMockServer;
import com.github.tomakehurst.wiremock.client.WireMock;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.http.HttpHeaders;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.reactive.server.WebTestClient;
import redis.embedded.RedisServer;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

import static com.github.tomakehurst.wiremock.client.WireMock.*;
import static com.github.tomakehurst.wiremock.core.WireMockConfiguration.wireMockConfig;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class GatewayRoutingTest {

    private static final String SECRET = "cortex-dev-secret-key-change-me-please-32";
    private static final SecretKey KEY =
            Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));

    private static RedisServer embeddedRedis;
    private static WireMockServer authWireMock;
    private static WireMockServer notesWireMock;

    @Autowired
    private WebTestClient webTestClient;

    @BeforeAll
    static void startInfrastructure() throws Exception {
        // Embedded Redis on a fixed test port
        embeddedRedis = new RedisServer(16379);
        embeddedRedis.start();

        // WireMock stubs for auth-service and notes-service
        authWireMock = new WireMockServer(wireMockConfig().dynamicPort());
        authWireMock.start();
        authWireMock.stubFor(post(urlEqualTo("/auth/login"))
                .willReturn(aResponse().withStatus(200).withBody("{\"accessToken\":\"test\"}")));

        notesWireMock = new WireMockServer(wireMockConfig().dynamicPort());
        notesWireMock.start();
        notesWireMock.stubFor(get(urlEqualTo("/notes/"))
                .willReturn(aResponse().withStatus(200).withBody("[]")));
    }

    @AfterAll
    static void stopInfrastructure() throws Exception {
        if (authWireMock != null) authWireMock.stop();
        if (notesWireMock != null) notesWireMock.stop();
        if (embeddedRedis != null) embeddedRedis.stop();
    }

    @DynamicPropertySource
    static void overrideProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.data.redis.url", () -> "redis://localhost:16379");
        registry.add("cortex.jwt.secret", () -> SECRET);
        registry.add("cortex.services.auth-url", () -> "http://localhost:" + authWireMock.port());
        registry.add("cortex.services.notes-url", () -> "http://localhost:" + notesWireMock.port());
    }

    // ── Tests ─────────────────────────────────────────────────────────────

    @Test
    void authRouteIsPublic_noJwtRequired() {
        webTestClient.post().uri("/auth/login")
                .bodyValue("{\"email\":\"a@b.com\",\"password\":\"pass\"}")
                .header(HttpHeaders.CONTENT_TYPE, "application/json")
                .exchange()
                .expectStatus().isOk();
    }

    @Test
    void notesRoute_returns401_whenNoJwt() {
        webTestClient.get().uri("/notes/")
                .exchange()
                .expectStatus().isUnauthorized();
    }

    @Test
    void notesRoute_returns401_whenJwtIsMalformed() {
        webTestClient.get().uri("/notes/")
                .header(HttpHeaders.AUTHORIZATION, "Bearer not.a.jwt")
                .exchange()
                .expectStatus().isUnauthorized();
    }

    @Test
    void notesRoute_forwardsRequest_whenJwtIsValid() {
        String token = buildToken("user-42");

        webTestClient.get().uri("/notes/")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .exchange()
                .expectStatus().isOk();
    }

    @Test
    void actuatorHealth_isPublic() {
        webTestClient.get().uri("/actuator/health")
                .exchange()
                .expectStatus().isOk();
    }

    // ── Helpers ───────────────────────────────────────────────────────────

    private String buildToken(String subject) {
        return Jwts.builder()
                .subject(subject)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 3_600_000))
                .signWith(KEY)
                .compact();
    }
}