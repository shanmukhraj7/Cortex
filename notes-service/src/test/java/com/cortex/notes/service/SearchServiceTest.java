package com.cortex.notes.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import com.cortex.notes.client.MLServiceClient;
import com.cortex.notes.dto.request.SearchRequest;
import com.cortex.notes.dto.response.SearchResponse;
import com.cortex.notes.dto.response.SearchResultItem;
import com.cortex.notes.entity.Note;
import com.cortex.notes.repository.NoteRepository;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
@DisplayName("SearchService unit tests")
class SearchServiceTest {

    @Mock MLServiceClient mlServiceClient;
    @Mock NoteRepository noteRepository;

    @InjectMocks SearchService searchService;

    private static final UUID USER_ID = UUID.randomUUID();
    private static final UUID NOTE_1   = UUID.randomUUID();
    private static final UUID NOTE_2   = UUID.randomUUID();

    private Note note1;
    private Note note2;

    @BeforeEach
    void setUp() {
        note1 = new Note(NOTE_1, USER_ID, "QuickSort", "QuickSort content",
                List.of("algorithms"), OffsetDateTime.now(), OffsetDateTime.now());
        note2 = new Note(NOTE_2, USER_ID, "MergeSort", "MergeSort content",
                List.of("algorithms"), OffsetDateTime.now(), OffsetDateTime.now());
    }

    @Test
    @DisplayName("search — returns ranked notes in ML order")
    void search_returnsRankedNotes() {
        List<SearchResultItem> mlResults = List.of(
                new SearchResultItem(NOTE_1, 0.92, 3.5),
                new SearchResultItem(NOTE_2, 0.80, 2.1));
        MLServiceClient.SearchMlResponse mlResponse =
                new MLServiceClient.SearchMlResponse(mlResults, 75.0, 20);

        when(mlServiceClient.search(eq("sorting"), eq(USER_ID), eq(5))).thenReturn(mlResponse);
        when(noteRepository.findByIdsForUser(anyList(), eq(USER_ID)))
                .thenReturn(Map.of(NOTE_1, note1, NOTE_2, note2));

        SearchResponse result = searchService.search(USER_ID, new SearchRequest("sorting", 5));

        assertThat(result.results()).hasSize(2);
        assertThat(result.results().get(0).id()).isEqualTo(NOTE_1);
        assertThat(result.results().get(0).similarityScore()).isEqualTo(0.92);
        assertThat(result.results().get(1).id()).isEqualTo(NOTE_2);
        assertThat(result.queryTimeMs()).isEqualTo(75.0);
        assertThat(result.retrievalCount()).isEqualTo(20);
    }

    @Test
    @DisplayName("search — filters out note IDs not found in DB")
    void search_filtersOrphanedIds() {
        UUID orphan = UUID.randomUUID();
        List<SearchResultItem> mlResults = List.of(
                new SearchResultItem(NOTE_1, 0.92, 3.5),
                new SearchResultItem(orphan, 0.75, 1.8));
        MLServiceClient.SearchMlResponse mlResponse =
                new MLServiceClient.SearchMlResponse(mlResults, 60.0, 20);

        when(mlServiceClient.search(any(), any(), anyInt())).thenReturn(mlResponse);
        when(noteRepository.findByIdsForUser(anyList(), eq(USER_ID)))
                .thenReturn(Map.of(NOTE_1, note1));   // orphan not present

        SearchResponse result = searchService.search(USER_ID, new SearchRequest("query", 5));

        assertThat(result.results()).hasSize(1);
        assertThat(result.results().get(0).id()).isEqualTo(NOTE_1);
    }

    @Test
    @DisplayName("search — returns empty response when ML returns no results")
    void search_emptyWhenNoResults() {
        MLServiceClient.SearchMlResponse emptyResponse =
                new MLServiceClient.SearchMlResponse(List.of(), 10.0, 0);
        when(mlServiceClient.search(any(), any(), anyInt())).thenReturn(emptyResponse);

        SearchResponse result = searchService.search(USER_ID, new SearchRequest("nothing", 5));

        assertThat(result.results()).isEmpty();
        assertThat(result.retrievalCount()).isZero();
        verifyNoInteractions(noteRepository);
    }

    @Test
    @DisplayName("search — uses topK=5 default when topK is null in request")
    void search_usesDefaultTopK() {
        MLServiceClient.SearchMlResponse emptyResponse =
                new MLServiceClient.SearchMlResponse(List.of(), 5.0, 0);
        when(mlServiceClient.search(eq("query"), eq(USER_ID), eq(5))).thenReturn(emptyResponse);

        searchService.search(USER_ID, new SearchRequest("query", null));

        verify(mlServiceClient).search("query", USER_ID, 5);
    }
}