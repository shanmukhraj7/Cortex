package com.cortex.notes.repository;

import com.cortex.notes.entity.Note;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface NoteRepository extends JpaRepository<Note, UUID> {
    
    Page<Note> findByUserId(String userId, Pageable pageable);

    @Query(value = "SELECT * FROM notes WHERE user_id = :userId AND :tag = ANY(tags)", nativeQuery = true)
    Page<Note> findByUserIdAndTag(@Param("userId") String userId, @Param("tag") String tag, Pageable pageable);

    Optional<Note> findByIdAndUserId(UUID id, String userId);

    @Query(value = """
        SELECT * FROM notes 
        WHERE user_id = :userId 
        ORDER BY embedding <-> cast(:queryEmbedding as vector) 
        LIMIT :limit
        """, nativeQuery = true)
    List<Note> findSimilarNotes(@Param("userId") String userId, @Param("queryEmbedding") String queryEmbedding, @Param("limit") int limit);
}
