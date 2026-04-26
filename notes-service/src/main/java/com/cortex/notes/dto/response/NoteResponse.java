package com.cortex.notes.dto.response;

import com.cortex.notes.entity.Note;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record NoteResponse(
        UUID id,
        String title,
        String content,
        List<String> tags,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt,
        Double similarityScore,
        Double rerankScore
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
