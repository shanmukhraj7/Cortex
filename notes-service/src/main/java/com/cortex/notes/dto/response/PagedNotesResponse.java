package com.cortex.notes.dto.response;

import java.util.List;

public record PagedNotesResponse(
        List<NoteResponse> notes,
        Pagination pagination
) {
    public record Pagination(
            int page,
            int limit,
            long total
    ) {}
}