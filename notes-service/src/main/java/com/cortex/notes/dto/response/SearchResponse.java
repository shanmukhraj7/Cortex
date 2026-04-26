package com.cortex.notes.dto.response;

import java.util.List;

public record SearchResponse(
        List<NoteResponse> results,
        double queryTimeMs,
        int retrievalCount
) {
}
