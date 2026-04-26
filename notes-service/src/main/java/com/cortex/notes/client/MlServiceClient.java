package com.cortex.notes.client;

import com.cortex.notes.dto.response.SearchResultItem;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
public class MLServiceClient {
    private final RestClient restClient;

    public MLServiceClient(@Value("${cortex.ml-service-url}") String mlServiceUrl, RestClient.Builder builder) {
        this.restClient = builder.baseUrl(mlServiceUrl).build();
    }

    public List<Float> embedDocument(String text) {
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

    public SearchMlResponse search(String query, UUID userId, int topK) {
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

    public record EmbedRequest(String text, @JsonProperty("is_query") boolean isQuery) {
    }

    public record EmbedResponse(List<Float> vector, String model, int dimensions) {
    }

    public record SearchMlRequest(String query, @JsonProperty("user_id") String userId, @JsonProperty("top_k") int topK) {
    }

    public record SearchMlResponse(
            List<SearchResultItem> results,
            @JsonProperty("query_time_ms") double queryTimeMs,
            @JsonProperty("retrieval_count") int retrievalCount
    ) {
    }
}
