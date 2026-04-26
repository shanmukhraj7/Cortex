package com.cortex.notes.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.UUID;

public record SearchResultItem(
        @JsonProperty("note_id") UUID noteId,
        @JsonProperty("similarity_score") double similarityScore,
        @JsonProperty("rerank_score") double rerankScore
) {
}
