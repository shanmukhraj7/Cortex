package com.cortex.notes.controller;

import com.cortex.notes.dto.request.SearchRequest;
import com.cortex.notes.dto.response.SearchResponse;
import com.cortex.notes.service.SearchService;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class SearchController {
    private final SearchService searchService;

    public SearchController(SearchService searchService) {
        this.searchService = searchService;
    }

    @PostMapping("/search")
    public SearchResponse search(@RequestHeader("X-User-Id") UUID userId, @Valid @RequestBody SearchRequest request) {
        return searchService.search(userId, request);
    }
}
