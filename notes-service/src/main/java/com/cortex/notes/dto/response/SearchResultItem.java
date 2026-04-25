package com.cortex.notes.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SearchResultItem {
    private UUID id;
    private String title;
    private String contentPreview;
    private List<String> tags;
    private double similarityScore;
    private double rerankScore;
    private ZonedDateTime createdAt;
}
