package com.cortex.notes.service;

import com.cortex.notes.client.MLServiceClient;
import com.cortex.notes.dto.request.SearchRequest;
import com.cortex.notes.dto.response.NoteResponse;
import com.cortex.notes.dto.response.SearchResponse;
import com.cortex.notes.dto.response.SearchResultItem;
import com.cortex.notes.entity.Note;
import com.cortex.notes.repository.NoteRepository;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SearchService {
    private final MLServiceClient mlServiceClient;
    private final NoteRepository notes;

    public SearchService(MLServiceClient mlServiceClient, NoteRepository notes) {
        this.mlServiceClient = mlServiceClient;
        this.notes = notes;
    }

    @Transactional(readOnly = true)
    public SearchResponse search(UUID userId, SearchRequest request) {
        MLServiceClient.SearchMlResponse mlResponse = mlServiceClient.search(
                request.query().trim(),
                userId,
                request.resolvedTopK()
        );
        List<UUID> ids = mlResponse.results().stream().map(SearchResultItem::noteId).toList();
        Map<UUID, Note> notesById = notes.findByIdsForUser(ids, userId);
        List<NoteResponse> results = mlResponse.results().stream()
                .map(result -> {
                    Note note = notesById.get(result.noteId());
                    return note == null ? null : NoteResponse.from(note, result.similarityScore(), result.rerankScore());
                })
                .filter(item -> item != null)
                .toList();
        return new SearchResponse(results, mlResponse.queryTimeMs(), mlResponse.retrievalCount());
    }
}
