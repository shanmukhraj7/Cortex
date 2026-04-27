package com.cortex.notes.service;

import com.cortex.notes.client.MLServiceClient;
import com.cortex.notes.dto.request.NoteRequest;
import com.cortex.notes.dto.response.NoteResponse;
import com.cortex.notes.dto.response.PagedNotesResponse;
import com.cortex.notes.entity.Note;
import com.cortex.notes.exception.NoteNotFoundException;
import com.cortex.notes.repository.NoteRepository;
import java.util.List;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Manages note CRUD and coordinates embedding with the ML service.
 *
 * <p>Cache strategy (Redis, 10 min TTL):
 * <ul>
 *   <li>{@code notes} cache — keyed by {@code userId:noteId}, holds a single {@link NoteResponse}.</li>
 *   <li>{@code get} populates the cache on miss.</li>
 *   <li>{@code update} overwrites the cache entry with the new state.</li>
 *   <li>{@code delete} evicts the entry so stale data is never served.</li>
 *   <li>{@code list} is intentionally not cached — paginated, tag-filtered results change
 *       often and would need complex invalidation; the DB query is cheap.</li>
 * </ul>
 */
@Service
public class NoteService {

    private static final Logger log = LoggerFactory.getLogger(NoteService.class);

    private final NoteRepository notes;
    private final MLServiceClient mlServiceClient;

    public NoteService(NoteRepository notes, MLServiceClient mlServiceClient) {
        this.notes = notes;
        this.mlServiceClient = mlServiceClient;
    }

    // ── Create ────────────────────────────────────────────────────────────

    /**
     * Creates a note: embeds the content via the ML service, persists note + vector,
     * and pre-warms the cache so the first {@code GET} is a cache hit.
     */
    @Transactional
    @CachePut(value = "notes", key = "#userId + ':' + #result.id()")
    public NoteResponse create(UUID userId, NoteRequest request) {
        log.debug("Creating note for user={}", userId);
        List<Float> embedding = mlServiceClient.embedDocument(request.content());
        Note note = notes.create(
                userId,
                request.title().trim(),
                request.content().trim(),
                request.tags(),
                embedding);
        return NoteResponse.from(note);
    }

    // ── Read ──────────────────────────────────────────────────────────────

    /**
     * Returns a paginated list of notes, optionally filtered by tag.
     * Not cached (see class-level Javadoc).
     */
    @Transactional(readOnly = true)
    public PagedNotesResponse list(UUID userId, int page, int limit, String tag) {
        int safePage  = Math.max(page, 1);
        int safeLimit = Math.min(Math.max(limit, 1), 100);
        int offset    = (safePage - 1) * safeLimit;

        List<NoteResponse> items = notes.findPage(userId, safeLimit, offset, tag).stream()
                .map(NoteResponse::from)
                .toList();
        long total = notes.count(userId, tag);
        return new PagedNotesResponse(items, new PagedNotesResponse.Pagination(safePage, safeLimit, total));
    }

    /**
     * Fetches a single note. Result is cached; subsequent calls within the TTL
     * window are served from Redis without a DB round-trip.
     */
    @Transactional(readOnly = true)
    @Cacheable(value = "notes", key = "#userId + ':' + #id")
    public NoteResponse get(UUID userId, UUID id) {
        log.debug("Cache miss — fetching note={} from DB", id);
        return notes.findByIdForUser(id, userId)
                .map(NoteResponse::from)
                .orElseThrow(() -> new NoteNotFoundException(id));
    }

    // ── Update ────────────────────────────────────────────────────────────

    /**
     * Updates note content, re-embeds via the ML service, and refreshes the cache.
     */
    @Transactional
    @CachePut(value = "notes", key = "#userId + ':' + #id")
    public NoteResponse update(UUID userId, UUID id, NoteRequest request) {
        log.debug("Updating note={} for user={}", id, userId);
        List<Float> embedding = mlServiceClient.embedDocument(request.content());
        Note note = notes.update(
                id,
                userId,
                request.title().trim(),
                request.content().trim(),
                request.tags(),
                embedding);
        if (note == null) {
            throw new NoteNotFoundException(id);
        }
        return NoteResponse.from(note);
    }

    // ── Delete ────────────────────────────────────────────────────────────

    /**
     * Deletes the note and evicts its cache entry so callers never see stale data.
     */
    @Transactional
    @CacheEvict(value = "notes", key = "#userId + ':' + #id")
    public void delete(UUID userId, UUID id) {
        log.debug("Deleting note={} for user={}", id, userId);
        if (!notes.delete(id, userId)) {
            throw new NoteNotFoundException(id);
        }
    }
}