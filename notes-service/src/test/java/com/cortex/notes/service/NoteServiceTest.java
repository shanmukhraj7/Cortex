package com.cortex.notes.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import com.cortex.notes.client.MLServiceClient;
import com.cortex.notes.dto.request.NoteRequest;
import com.cortex.notes.dto.response.NoteResponse;
import com.cortex.notes.dto.response.PagedNotesResponse;
import com.cortex.notes.entity.Note;
import com.cortex.notes.exception.NoteNotFoundException;
import com.cortex.notes.repository.NoteRepository;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
@DisplayName("NoteService unit tests")
class NoteServiceTest {

    @Mock NoteRepository noteRepository;
    @Mock MLServiceClient mlServiceClient;

    @InjectMocks NoteService noteService;

    private static final UUID USER_ID = UUID.randomUUID();
    private static final UUID NOTE_ID = UUID.randomUUID();
    private static final List<Float> DUMMY_EMBEDDING = List.of(0.1f, 0.2f, 0.3f);

    private Note sampleNote;

    @BeforeEach
    void setUp() {
        sampleNote = new Note(
                NOTE_ID, USER_ID, "Test title", "Test content",
                List.of("java"), OffsetDateTime.now(), OffsetDateTime.now());
    }

    // ── create ────────────────────────────────────────────────────────────

    @Test
    @DisplayName("create — embeds content and persists note")
    void create_embedsAndPersists() {
        when(mlServiceClient.embedDocument("Test content")).thenReturn(DUMMY_EMBEDDING);
        when(noteRepository.create(eq(USER_ID), eq("Test title"), eq("Test content"),
                anyList(), eq(DUMMY_EMBEDDING))).thenReturn(sampleNote);

        NoteRequest req = new NoteRequest("Test title", "Test content", List.of("java"));
        NoteResponse result = noteService.create(USER_ID, req);

        assertThat(result.id()).isEqualTo(NOTE_ID);
        assertThat(result.title()).isEqualTo("Test title");
        verify(mlServiceClient).embedDocument("Test content");
        verify(noteRepository).create(eq(USER_ID), eq("Test title"), eq("Test content"),
                anyList(), eq(DUMMY_EMBEDDING));
    }

    @Test
    @DisplayName("create — trims whitespace from title and content")
    void create_trimsWhitespace() {
        when(mlServiceClient.embedDocument("Content")).thenReturn(DUMMY_EMBEDDING);
        Note trimmed = new Note(NOTE_ID, USER_ID, "Title", "Content",
                List.of(), OffsetDateTime.now(), OffsetDateTime.now());
        when(noteRepository.create(eq(USER_ID), eq("Title"), eq("Content"),
                anyList(), any())).thenReturn(trimmed);

        NoteRequest req = new NoteRequest("  Title  ", "  Content  ", List.of());
        NoteResponse result = noteService.create(USER_ID, req);

        verify(noteRepository).create(eq(USER_ID), eq("Title"), eq("Content"), anyList(), any());
        assertThat(result.title()).isEqualTo("Title");
    }

    // ── get ───────────────────────────────────────────────────────────────

    @Test
    @DisplayName("get — returns note when found")
    void get_returnsNote() {
        when(noteRepository.findByIdForUser(NOTE_ID, USER_ID)).thenReturn(Optional.of(sampleNote));

        NoteResponse result = noteService.get(USER_ID, NOTE_ID);

        assertThat(result.id()).isEqualTo(NOTE_ID);
        assertThat(result.content()).isEqualTo("Test content");
    }

    @Test
    @DisplayName("get — throws NoteNotFoundException when not found")
    void get_throwsWhenMissing() {
        when(noteRepository.findByIdForUser(NOTE_ID, USER_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> noteService.get(USER_ID, NOTE_ID))
                .isInstanceOf(NoteNotFoundException.class)
                .hasMessageContaining(NOTE_ID.toString());
    }

    // ── list ──────────────────────────────────────────────────────────────

    @Test
    @DisplayName("list — returns paginated response")
    void list_returnsPaginatedResponse() {
        when(noteRepository.findPage(USER_ID, 20, 0, null)).thenReturn(List.of(sampleNote));
        when(noteRepository.count(USER_ID, null)).thenReturn(1L);

        PagedNotesResponse result = noteService.list(USER_ID, 1, 20, null);

        assertThat(result.notes()).hasSize(1);
        assertThat(result.pagination().total()).isEqualTo(1);
        assertThat(result.pagination().page()).isEqualTo(1);
    }

    @Test
    @DisplayName("list — clamps limit to 100")
    void list_clampsLimit() {
        when(noteRepository.findPage(eq(USER_ID), eq(100), eq(0), isNull()))
                .thenReturn(List.of());
        when(noteRepository.count(eq(USER_ID), isNull())).thenReturn(0L);

        noteService.list(USER_ID, 1, 999, null);

        verify(noteRepository).findPage(USER_ID, 100, 0, null);
    }

    // ── update ────────────────────────────────────────────────────────────

    @Test
    @DisplayName("update — re-embeds, updates DB, returns updated note")
    void update_reEmbeds() {
        when(mlServiceClient.embedDocument("New content")).thenReturn(DUMMY_EMBEDDING);
        Note updated = new Note(NOTE_ID, USER_ID, "New title", "New content",
                List.of("java"), OffsetDateTime.now(), OffsetDateTime.now());
        when(noteRepository.update(eq(NOTE_ID), eq(USER_ID), eq("New title"), eq("New content"),
                anyList(), eq(DUMMY_EMBEDDING))).thenReturn(updated);

        NoteRequest req = new NoteRequest("New title", "New content", List.of("java"));
        NoteResponse result = noteService.update(USER_ID, NOTE_ID, req);

        assertThat(result.title()).isEqualTo("New title");
        verify(mlServiceClient).embedDocument("New content");
    }

    @Test
    @DisplayName("update — throws NoteNotFoundException when note not owned by user")
    void update_throwsWhenNotFound() {
        when(mlServiceClient.embedDocument(any())).thenReturn(DUMMY_EMBEDDING);
        when(noteRepository.update(any(), any(), any(), any(), any(), any())).thenReturn(null);

        NoteRequest req = new NoteRequest("T", "C", List.of());
        assertThatThrownBy(() -> noteService.update(USER_ID, NOTE_ID, req))
                .isInstanceOf(NoteNotFoundException.class);
    }

    // ── delete ────────────────────────────────────────────────────────────

    @Test
    @DisplayName("delete — removes note from repository")
    void delete_removesNote() {
        when(noteRepository.delete(NOTE_ID, USER_ID)).thenReturn(true);

        noteService.delete(USER_ID, NOTE_ID);

        verify(noteRepository).delete(NOTE_ID, USER_ID);
    }

    @Test
    @DisplayName("delete — throws NoteNotFoundException when delete returns false")
    void delete_throwsWhenNotFound() {
        when(noteRepository.delete(NOTE_ID, USER_ID)).thenReturn(false);

        assertThatThrownBy(() -> noteService.delete(USER_ID, NOTE_ID))
                .isInstanceOf(NoteNotFoundException.class);
    }
}