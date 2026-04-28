package com.cortex.notes.controller;

import com.cortex.notes.dto.request.NoteRequest;
import com.cortex.notes.dto.response.NoteResponse;
import com.cortex.notes.dto.response.PagedNotesResponse;
import com.cortex.notes.service.NoteService;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/notes")
public class NoteController {

    private final NoteService noteService;

    public NoteController(NoteService noteService) {
        this.noteService = noteService;
    }

    /**
     * GET /notes — paginated list, optional tag filter.
     * Matches both /notes and /notes/ via Spring's default trailing-slash handling.
     */
    @GetMapping({"", "/"})
    public PagedNotesResponse list(
            @RequestHeader("X-User-Id") UUID userId,
            @RequestParam(defaultValue = "1")  int page,
            @RequestParam(defaultValue = "20") int limit,
            @RequestParam(required = false)    String tag
    ) {
        return noteService.list(userId, page, limit, tag);
    }

    @GetMapping("/{id}")
    public NoteResponse get(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable UUID id
    ) {
        return noteService.get(userId, id);
    }

    @PostMapping({"", "/"})
    @ResponseStatus(HttpStatus.CREATED)
    public NoteResponse create(
            @RequestHeader("X-User-Id") UUID userId,
            @Valid @RequestBody NoteRequest request
    ) {
        return noteService.create(userId, request);
    }

    @PutMapping("/{id}")
    public NoteResponse update(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable UUID id,
            @Valid @RequestBody NoteRequest request
    ) {
        return noteService.update(userId, id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable UUID id
    ) {
        noteService.delete(userId, id);
    }
}