package com.cortex.notes.entity;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public class Note {
    private UUID id;
    private UUID userId;
    private String title;
    private String content;
    private List<String> tags;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    public Note(UUID id, UUID userId, String title, String content, List<String> tags, OffsetDateTime createdAt, OffsetDateTime updatedAt) {
        this.id = id;
        this.userId = userId;
        this.title = title;
        this.content = content;
        this.tags = tags;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public UUID getId() {
        return id;
    }

    public UUID getUserId() {
        return userId;
    }

    public String getTitle() {
        return title;
    }

    public String getContent() {
        return content;
    }

    public List<String> getTags() {
        return tags;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }
}
