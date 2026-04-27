package com.cortex.notes.client;

import com.cortex.notes.dto.response.SearchResultItem;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import java.util.List;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

/**
 * HTTP client for the Python FastAPI ML service.
 *
 * <p>Both methods are protected by:
 * <ul>
 *   <li>A Resilience4j circuit breaker — opens after sustained failures so the
 *       notes service degrades gracefully instead of piling up blocked threads.</li>
 *   <li>A retry (max 2 attempts, 500 ms wait) — handles transient network hiccups
 *       without surfacing them to the caller.</li>
 * </ul>
 */
@Component
public class MLServiceClient {

    private static final Logger log = LoggerFactory.getLogger(MLServiceClient.class);

    private final RestClient restClient;

    public MLServiceClient(
            @Value("${cortex.ml-service-url}") String mlServiceUrl,
            RestClient.Builder builder) {
        this.restClient = builder
                .baseUrl(mlServiceUrl)
                .defaultStatusHandler(HttpStatusCode::isError, (request, response) -> {
                    throw new RestClientException(
                            "ML service responded with HTTP " + response.getStatusCode());
                })
                .build();
    }

    // ── Embedding ─────────────────────────────────────────────────────────

    /**
     * Embed a document text and return a 1 024-dimensional float vector.
     *
     * @throws RestClientException when the ML service is unavailable or returns an error.
     */
    @CircuitBreaker(name = "ml-embed", fallbackMethod = "embedFallback")
    @Retry(name = "ml-embed")
    public List<Float> embedDocument(String text) {
        log.debug("Embedding document, length={}", text.length());
        EmbedResponse response = restClient.post()
                .uri("/embed")
                .body(new EmbedRequest(text, false))
                .retrieve()
                .body(EmbedResponse.class);

        if (response == null || response.vector() == null || response.vector().isEmpty()) {
            throw new IllegalStateException("ML service returned an empty embedding.");
        }
        return response.vector();
    }

    /**
     * Fallback: rethrows a descriptive exception so the caller (NoteService) can
     * surface a 503 to the API consumer rather than hanging or returning garbage.
     */
    @SuppressWarnings("unused")
    private List<Float> embedFallback(String text, Exception ex) {
        log.warn("ML embed circuit open or retry exhausted: {}", ex.getMessage());
        throw new RestClientException(
                "Embedding service is currently unavailable. Please try again later.");
    }

    // ── Search ────────────────────────────────────────────────────────────

    /**
     * Run the two-stage semantic search on the ML service and return ranked results.
     */
    @CircuitBreaker(name = "ml-search", fallbackMethod = "searchFallback")
    @Retry(name = "ml-search")
    public SearchMlResponse search(String query, UUID userId, int topK) {
        log.debug("ML search: userId={} query='{}' topK={}", userId, query, topK);
        SearchMlResponse response = restClient.post()
                .uri("/search")
                .body(new SearchMlRequest(query, userId.toString(), topK))
                .retrieve()
                .body(SearchMlResponse.class);

        if (response == null) {
            throw new IllegalStateException("ML service returned an empty search response.");
        }
        return response;
    }

    @SuppressWarnings("unused")
    private SearchMlResponse searchFallback(String query, UUID userId, int topK, Exception ex) {
        log.warn("ML search circuit open or retry exhausted: {}", ex.getMessage());
        throw new RestClientException(
                "Search service is currently unavailable. Please try again later.");
    }

    // ── DTO records ───────────────────────────────────────────────────────

    public record EmbedRequest(
            String text,
            @JsonProperty("is_query") boolean isQuery) {
    }

    public record EmbedResponse(
            List<Float> vector,
            String model,
            int dimensions) {
    }

    public record SearchMlRequest(
            String query,
            @JsonProperty("user_id") String userId,
            @JsonProperty("top_k") int topK) {
    }

    public record SearchMlResponse(
            List<SearchResultItem> results,
            @JsonProperty("query_time_ms") double queryTimeMs,
            @JsonProperty("retrieval_count") int retrievalCount) {
    }
}