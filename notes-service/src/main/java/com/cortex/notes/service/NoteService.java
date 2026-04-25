package com.cortex.notes.service;

import com.cortex.notes.client.MlServiceClient;
import com.cortex.notes.dto.request.NoteRequest;
import com.cortex.notes.dto.response.NoteResponse;
import com.cortex.notes.dto.response.PagedNotesResponse;
import com.cortex.notes.entity.Note;
import com.cortex.notes.exception.NoteNotFoundException;
import com.cortex.notes.exception.UnauthorizedException;
import com.cortex.notes.repository.NoteRepository;
import com.cortex.notes.security.JwtContextFilter;
import com.pgvector.PGvector;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NoteService {

    private final NoteRepository noteRepository;
    private final MlServiceClient mlServiceClient;

    private String getUserId() {
        String userId = JwtContextFilter.getCurrentUserId();
        if (userId == null) {
            throw new UnauthorizedException("User not authenticated");
        }
        return userId;
    }

    @Transactional
    public NoteResponse createNote(NoteRequest request) {
        String userId = getUserId();
        
        List<Float> embeddingList = mlServiceClient.getEmbedding(request.getContent());
        float[] embeddingArray = new float[embeddingList.size()];
        for (int i = 0; i < embeddingList.size(); i++) {
            embeddingArray[i] = embeddingList.get(i);
        }
        PGvector pgVector = new PGvector(embeddingArray);

        Note note = Note.builder()
                .userId(userId)
                .title(request.getTitle())
                .content(request.getContent())
                .tags(request.getTags())
                .embedding(pgVector)
                .build();

        Note savedNote = noteRepository.save(note);
        return mapToResponse(savedNote);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "notes", key = "#id + '-' + @noteService.getUserIdForCache()")
    public NoteResponse getNoteById(UUID id) {
        String userId = getUserId();
        Note note = noteRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new NoteNotFoundException("Note not found or you don't have access"));
        return mapToResponse(note);
    }

    // Helper method for Cacheable key
    public String getUserIdForCache() {
        return getUserId();
    }

    @Transactional(readOnly = true)
    public PagedNotesResponse getNotes(int page, int size, String tag) {
        String userId = getUserId();
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        
        Page<Note> notePage;
        if (tag != null && !tag.isBlank()) {
            notePage = noteRepository.findByUserIdAndTag(userId, tag, pageable);
        } else {
            notePage = noteRepository.findByUserId(userId, pageable);
        }

        List<NoteResponse> content = notePage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return PagedNotesResponse.builder()
                .content(content)
                .pageNumber(notePage.getNumber())
                .pageSize(notePage.getSize())
                .totalElements(notePage.getTotalElements())
                .totalPages(notePage.getTotalPages())
                .isLast(notePage.isLast())
                .build();
    }

    @Transactional
    @CacheEvict(value = "notes", key = "#id + '-' + @noteService.getUserIdForCache()")
    public NoteResponse updateNote(UUID id, NoteRequest request) {
        String userId = getUserId();
        Note note = noteRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new NoteNotFoundException("Note not found or you don't have access"));

        note.setTitle(request.getTitle());
        note.setContent(request.getContent());
        note.setTags(request.getTags());

        // Re-embed because content changed
        List<Float> embeddingList = mlServiceClient.getEmbedding(request.getContent());
        float[] embeddingArray = new float[embeddingList.size()];
        for (int i = 0; i < embeddingList.size(); i++) {
            embeddingArray[i] = embeddingList.get(i);
        }
        note.setEmbedding(new PGvector(embeddingArray));

        Note updatedNote = noteRepository.save(note);
        return mapToResponse(updatedNote);
    }

    @Transactional
    @CacheEvict(value = "notes", key = "#id + '-' + @noteService.getUserIdForCache()")
    public void deleteNote(UUID id) {
        String userId = getUserId();
        Note note = noteRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new NoteNotFoundException("Note not found or you don't have access"));
        noteRepository.delete(note);
    }

    private NoteResponse mapToResponse(Note note) {
        return NoteResponse.builder()
                .id(note.getId())
                .title(note.getTitle())
                .content(note.getContent())
                .tags(note.getTags())
                .createdAt(note.getCreatedAt())
                .updatedAt(note.getUpdatedAt())
                .build();
    }
}
