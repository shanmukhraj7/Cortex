package com.cortex.notes.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;

public record NoteRequest(
        @NotBlank @Size(max = 240) String title,
        @NotBlank @Size(max = 8192) String content,
        List<@Size(max = 64) String> tags
) {
}
