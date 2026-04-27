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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Coordinates two-stage semantic search:
 * <ol>
 *   <li>Delegates to the ML service (bi-encoder ANN + cross-encoder rerank).</li>
 *   <li>Hydrates note metadata from the notes DB using the returned note IDs.</li>
 *   <li>Preserves the ML-ranked order in the final response.</li>
 * </ol>
 */
@Service
public class SearchService {

    private static final Logger log = LoggerFactory.getLogger(SearchService.class);

    private final MLServiceClient mlServiceClient;
    private final NoteRepository notes;

    public SearchService(MLServiceClient mlServiceClient, NoteRepository notes) {
        this.mlServiceClient = mlServiceClient;
        this.notes = notes;
    }

    @Transactional(readOnly = true)
    public SearchResponse search(UUID userId, SearchRequest request) {
        log.debug("Semantic search: userId={} query='{}' topK={}",
                userId, request.query(), request.resolvedTopK());

        MLServiceClient.SearchMlResponse mlResponse = mlServiceClient.search(
                request.query().trim(),
                userId,
                request.resolvedTopK());

        if (mlResponse.results().isEmpty()) {
            return new SearchResponse(List.of(), mlResponse.queryTimeMs(), 0);
        }

        // Fetch note metadata for all returned IDs in a single IN-query
        List<UUID> ids = mlResponse.results().stream()
                .map(SearchResultItem::noteId)
                .toList();
        Map<UUID, Note> notesById = notes.findByIdsForUser(ids, userId);

        // Rebuild results in ML-ranked order, dropping any IDs not found
        List<NoteResponse> results = mlResponse.results().stream()
                .filter(r -> notesById.containsKey(r.noteId()))
                .map(r -> NoteResponse.from(notesById.get(r.noteId()),
                        r.similarityScore(), r.rerankScore()))
                .toList();

        log.info("Search done: userId={} query='{}' returned={} retrievalCount={}",
                userId, request.query(), results.size(), mlResponse.retrievalCount());

        return new SearchResponse(results, mlResponse.queryTimeMs(), mlResponse.retrievalCount());
    }
}