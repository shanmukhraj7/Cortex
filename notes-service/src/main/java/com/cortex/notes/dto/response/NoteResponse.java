package com.cortex.notes.dto.response;

import com.cortex.notes.entity.Note;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Wire DTO returned by every note endpoint.
 *
 * All field names use explicit @JsonProperty with snake_case so that:
 *   1. The REST API always returns snake_case regardless of Jackson global config.
 *   2. The React frontend can read note.created_at, note.similarity_score, etc.
 *   3. Redis serialisation round-trips correctly (type info is embedded by RedisConfig).
 */
public record NoteResponse(
        UUID id,
        String title,
        String content,
        List<String> tags,
        @JsonProperty("created_at")     OffsetDateTime createdAt,
        @JsonProperty("updated_at")     OffsetDateTime updatedAt,
        @JsonProperty("similarity_score") Double similarityScore,
        @JsonProperty("rerank_score")   Double rerankScore
) {
    public static NoteResponse from(Note note) {
        return from(note, null, null);
    }

    public static NoteResponse from(Note note, Double similarityScore, Double rerankScore) {
        return new NoteResponse(
                note.getId(),
                note.getTitle(),
                note.getContent(),
                note.getTags(),
                note.getCreatedAt(),
                note.getUpdatedAt(),
                similarityScore,
                rerankScore
        );
    }
}