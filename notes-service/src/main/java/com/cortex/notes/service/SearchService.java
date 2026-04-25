package com.cortex.notes.service;

import com.cortex.notes.client.MlServiceClient;
import com.cortex.notes.dto.request.SearchRequest;
import com.cortex.notes.dto.response.SearchResponse;
import com.cortex.notes.dto.response.SearchResultItem;
import com.cortex.notes.security.JwtContextFilter;
import com.cortex.notes.exception.UnauthorizedException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.ZonedDateTime;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SearchService {

    private final MlServiceClient mlServiceClient;

    public SearchResponse search(SearchRequest request) {
        String userId = JwtContextFilter.getCurrentUserId();
        if (userId == null) {
            throw new UnauthorizedException("User not authenticated");
        }

        MlServiceClient.SearchResponseData mlResponse = mlServiceClient.search(
                request.getQuery(),
                userId,
                request.getTopK()
        );

        return SearchResponse.builder()
                .results(mlResponse.getResults().stream().map(data -> 
                    SearchResultItem.builder()
                            .id(java.util.UUID.fromString(data.getId()))
                            .title(data.getTitle())
                            .contentPreview(data.getContent_preview())
                            .tags(data.getTags())
                            .similarityScore(data.getSimilarity_score())
                            .rerankScore(data.getRerank_score())
                            .createdAt(data.getCreated_at() != null ? ZonedDateTime.parse(data.getCreated_at()) : null)
                            .build()
                ).collect(Collectors.toList()))
                .queryTimeMs(mlResponse.getQuery_time_ms())
                .retrievalCount(mlResponse.getRetrieval_count())
                .build();
    }
}
