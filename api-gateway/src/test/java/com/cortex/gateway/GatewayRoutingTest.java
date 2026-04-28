package com.cortex.gateway;

import com.github.tomakehurst.wiremock.WireMockServer;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
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
        embeddedRedis = new RedisServer(16379);
        embeddedRedis.start();

        authWireMock = new WireMockServer(wireMockConfig().dynamicPort());
        authWireMock.start();
        // Match both /auth/login and /auth/register
        authWireMock.stubFor(post(urlMatching("/auth/.*"))
                .willReturn(aResponse().withStatus(200)
                        .withHeader("Content-Type", "application/json")
                        .withBody("{\"access_token\":\"test\",\"token_type\":\"Bearer\"}")));

        notesWireMock = new WireMockServer(wireMockConfig().dynamicPort());
        notesWireMock.start();
        // Stub both /notes (exact) and /notes/* (sub-paths)
        notesWireMock.stubFor(get(urlEqualTo("/notes"))
                .willReturn(aResponse().withStatus(200)
                        .withHeader("Content-Type", "application/json")
                        .withBody("{\"notes\":[],\"pagination\":{\"page\":1,\"limit\":20,\"total\":0}}")));
        notesWireMock.stubFor(post(urlEqualTo("/notes"))
                .willReturn(aResponse().withStatus(201)
                        .withHeader("Content-Type", "application/json")
                        .withBody("{\"id\":\"00000000-0000-0000-0000-000000000001\",\"title\":\"t\",\"content\":\"c\",\"tags\":[]}")));
    }

    @AfterAll
    static void stopInfrastructure() throws Exception {
        if (authWireMock  != null) authWireMock.stop();
        if (notesWireMock != null) notesWireMock.stop();
        if (embeddedRedis != null) embeddedRedis.stop();
    }

    @DynamicPropertySource
    static void overrideProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.data.redis.url", () -> "redis://localhost:16379");
        registry.add("cortex.jwt.secret",     () -> SECRET);
        registry.add("cortex.services.auth-url",  () -> "http://localhost:" + authWireMock.port());
        registry.add("cortex.services.notes-url", () -> "http://localhost:" + notesWireMock.port());
    }

    // ── Auth routes ──────────────────────────────────────────────────────────

    @Test
    void authRoute_isPublic_noJwtRequired() {
        webTestClient.post().uri("/auth/login")
                .bodyValue("{\"email\":\"a@b.com\",\"password\":\"password1\"}")
                .header(HttpHeaders.CONTENT_TYPE, "application/json")
                .exchange()
                .expectStatus().isOk();
    }

    // ── Notes routes ─────────────────────────────────────────────────────────

    @Test
    void notesRoute_GET_returns401_whenNoJwt() {
        webTestClient.get().uri("/notes")
                .exchange()
                .expectStatus().isUnauthorized();
    }

    @Test
    void notesRoute_POST_returns401_whenNoJwt() {
        webTestClient.post().uri("/notes")
                .bodyValue("{\"title\":\"t\",\"content\":\"c\",\"tags\":[]}")
                .header(HttpHeaders.CONTENT_TYPE, "application/json")
                .exchange()
                .expectStatus().isUnauthorized();
    }

    @Test
    void notesRoute_GET_returns401_whenJwtIsMalformed() {
        webTestClient.get().uri("/notes")
                .header(HttpHeaders.AUTHORIZATION, "Bearer not.a.jwt")
                .exchange()
                .expectStatus().isUnauthorized();
    }

    @Test
    void notesRoute_GET_forwardsRequest_whenJwtIsValid() {
        webTestClient.get().uri("/notes")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + buildToken("user-42"))
                .exchange()
                .expectStatus().isOk();
    }

    @Test
    void notesRoute_POST_forwardsRequest_whenJwtIsValid() {
        webTestClient.post().uri("/notes")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + buildToken("user-42"))
                .header(HttpHeaders.CONTENT_TYPE, "application/json")
                .bodyValue("{\"title\":\"t\",\"content\":\"c\",\"tags\":[]}")
                .exchange()
                .expectStatus().isCreated();
    }

    // ── Actuator ─────────────────────────────────────────────────────────────

    @Test
    void actuatorHealth_isPublic() {
        webTestClient.get().uri("/actuator/health")
                .exchange()
                .expectStatus().isOk();
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private String buildToken(String subject) {
        return Jwts.builder()
                .subject(subject)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 3_600_000))
                .signWith(KEY)
                .compact();
    }
}