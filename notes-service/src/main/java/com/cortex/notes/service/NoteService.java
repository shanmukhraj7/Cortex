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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NoteService {
    private final NoteRepository notes;
    private final MLServiceClient mlServiceClient;

    public NoteService(NoteRepository notes, MLServiceClient mlServiceClient) {
        this.notes = notes;
        this.mlServiceClient = mlServiceClient;
    }

    @Transactional
    public NoteResponse create(UUID userId, NoteRequest request) {
        List<Float> embedding = mlServiceClient.embedDocument(request.content());
        Note note = notes.create(userId, request.title().trim(), request.content().trim(), request.tags(), embedding);
        return NoteResponse.from(note);
    }

    @Transactional(readOnly = true)
    public PagedNotesResponse list(UUID userId, int page, int limit, String tag) {
        int safePage = Math.max(page, 1);
        int safeLimit = Math.min(Math.max(limit, 1), 100);
        int offset = (safePage - 1) * safeLimit;
        List<NoteResponse> items = notes.findPage(userId, safeLimit, offset, tag).stream()
                .map(NoteResponse::from)
                .toList();
        long total = notes.count(userId, tag);
        return new PagedNotesResponse(items, new PagedNotesResponse.Pagination(safePage, safeLimit, total));
    }

    @Transactional(readOnly = true)
    public NoteResponse get(UUID userId, UUID id) {
        return notes.findByIdForUser(id, userId)
                .map(NoteResponse::from)
                .orElseThrow(() -> new NoteNotFoundException(id));
    }

    @Transactional
    public NoteResponse update(UUID userId, UUID id, NoteRequest request) {
        List<Float> embedding = mlServiceClient.embedDocument(request.content());
        Note note = notes.update(id, userId, request.title().trim(), request.content().trim(), request.tags(), embedding);
        if (note == null) {
            throw new NoteNotFoundException(id);
        }
        return NoteResponse.from(note);
    }

    @Transactional
    public void delete(UUID userId, UUID id) {
        if (!notes.delete(id, userId)) {
            throw new NoteNotFoundException(id);
        }
    }
}
