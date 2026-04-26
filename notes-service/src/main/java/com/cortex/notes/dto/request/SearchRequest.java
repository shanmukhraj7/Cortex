package com.cortex.notes.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SearchRequest(
        @NotBlank @Size(max = 512) String query,
        @JsonProperty("top_k") @Min(1) @Max(20) Integer topK
) {
    public int resolvedTopK() {
        return topK == null ? 5 : topK;
    }
}
