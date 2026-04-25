package com.cortex.notes.client;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;

@Component
public class MlServiceClient {

    private final RestClient restClient;

    public MlServiceClient(@Value("${app.ml-service.url}") String mlServiceUrl) {
        this.restClient = RestClient.builder()
                .baseUrl(mlServiceUrl)
                .build();
    }

    public List<Float> getEmbedding(String text) {
        EmbedRequest request = new EmbedRequest(text, false);
        EmbedResponse response = restClient.post()
                .uri("/embed")
                .contentType(MediaType.APPLICATION_JSON)
                .body(request)
                .retrieve()
                .body(EmbedResponse.class);

        return response != null ? response.getEmbedding() : null;
    }

    public SearchResponseData search(String query, String userId, int topK) {
        SearchRequestData request = new SearchRequestData(query, userId, topK);
        return restClient.post()
                .uri("/search")
                .contentType(MediaType.APPLICATION_JSON)
                .body(request)
                .retrieve()
                .body(SearchResponseData.class);
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class EmbedRequest {
        private String text;
        private boolean is_query;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class EmbedResponse {
        private List<Float> embedding;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class SearchRequestData {
        private String query;
        private String user_id;
        private int top_k;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class SearchResponseData {
        private List<SearchResultItemData> results;
        private long query_time_ms;
        private int retrieval_count;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class SearchResultItemData {
        private String id;
        private String title;
        private String content_preview;
        private List<String> tags;
        private double similarity_score;
        private double rerank_score;
        private String created_at;
    }
}
