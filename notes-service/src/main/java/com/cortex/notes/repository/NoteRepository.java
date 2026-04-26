package com.cortex.notes.repository;

import com.cortex.notes.entity.Note;
import java.sql.Array;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class NoteRepository {
    private static final String NOTE_COLUMNS = "id, user_id, title, content, tags, created_at, updated_at";

    private final JdbcTemplate jdbc;
    private final NamedParameterJdbcTemplate namedJdbc;
    private final RowMapper<Note> mapper = new NoteRowMapper();

    public NoteRepository(JdbcTemplate jdbc, NamedParameterJdbcTemplate namedJdbc) {
        this.jdbc = jdbc;
        this.namedJdbc = namedJdbc;
    }

    public Note create(UUID userId, String title, String content, List<String> tags, List<Float> embedding) {
        String sql = """
                INSERT INTO notes (user_id, title, content, tags, embedding)
                VALUES (?, ?, ?, ?, CAST(? AS vector))
                RETURNING id, user_id, title, content, tags, created_at, updated_at
                """;
        return jdbc.query(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql);
            ps.setObject(1, userId);
            ps.setString(2, title);
            ps.setString(3, content);
            ps.setArray(4, connection.createArrayOf("text", normalizeTags(tags).toArray(String[]::new)));
            ps.setString(5, toVectorLiteral(embedding));
            return ps;
        }, mapper).getFirst();
    }

    public Note update(UUID id, UUID userId, String title, String content, List<String> tags, List<Float> embedding) {
        String sql = """
                UPDATE notes
                SET title = ?, content = ?, tags = ?, embedding = CAST(? AS vector), updated_at = NOW()
                WHERE id = ? AND user_id = ?
                RETURNING id, user_id, title, content, tags, created_at, updated_at
                """;
        List<Note> notes = jdbc.query(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql);
            ps.setString(1, title);
            ps.setString(2, content);
            ps.setArray(3, connection.createArrayOf("text", normalizeTags(tags).toArray(String[]::new)));
            ps.setString(4, toVectorLiteral(embedding));
            ps.setObject(5, id);
            ps.setObject(6, userId);
            return ps;
        }, mapper);
        return notes.isEmpty() ? null : notes.getFirst();
    }

    public Optional<Note> findByIdForUser(UUID id, UUID userId) {
        String sql = "SELECT " + NOTE_COLUMNS + " FROM notes WHERE id = ? AND user_id = ?";
        List<Note> notes = jdbc.query(sql, mapper, id, userId);
        return notes.stream().findFirst();
    }

    public List<Note> findPage(UUID userId, int limit, int offset, String tag) {
        if (tag == null || tag.isBlank()) {
            return jdbc.query(
                    "SELECT " + NOTE_COLUMNS + " FROM notes WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?",
                    mapper,
                    userId,
                    limit,
                    offset
            );
        }
        return jdbc.query(
                "SELECT " + NOTE_COLUMNS + " FROM notes WHERE user_id = ? AND ? = ANY(tags) ORDER BY created_at DESC LIMIT ? OFFSET ?",
                mapper,
                userId,
                tag.trim().toLowerCase(),
                limit,
                offset
        );
    }

    public long count(UUID userId, String tag) {
        if (tag == null || tag.isBlank()) {
            Long count = jdbc.queryForObject("SELECT COUNT(*) FROM notes WHERE user_id = ?", Long.class, userId);
            return count == null ? 0 : count;
        }
        Long count = jdbc.queryForObject(
                "SELECT COUNT(*) FROM notes WHERE user_id = ? AND ? = ANY(tags)",
                Long.class,
                userId,
                tag.trim().toLowerCase()
        );
        return count == null ? 0 : count;
    }

    public Map<UUID, Note> findByIdsForUser(List<UUID> ids, UUID userId) {
        if (ids.isEmpty()) {
            return Collections.emptyMap();
        }
        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("ids", ids)
                .addValue("userId", userId);
        List<Note> notes = namedJdbc.query(
                "SELECT " + NOTE_COLUMNS + " FROM notes WHERE user_id = :userId AND id IN (:ids)",
                params,
                mapper
        );
        Map<UUID, Note> byId = new LinkedHashMap<>();
        for (Note note : notes) {
            byId.put(note.getId(), note);
        }
        return byId;
    }

    public boolean delete(UUID id, UUID userId) {
        return jdbc.update("DELETE FROM notes WHERE id = ? AND user_id = ?", id, userId) > 0;
    }

    private static List<String> normalizeTags(List<String> tags) {
        if (tags == null) {
            return List.of();
        }
        return tags.stream()
                .filter(tag -> tag != null && !tag.isBlank())
                .map(tag -> tag.trim().toLowerCase())
                .distinct()
                .toList();
    }

    private static String toVectorLiteral(List<Float> embedding) {
        if (embedding == null || embedding.isEmpty()) {
            throw new IllegalArgumentException("Embedding cannot be empty.");
        }
        StringBuilder builder = new StringBuilder("[");
        for (int i = 0; i < embedding.size(); i++) {
            if (i > 0) {
                builder.append(',');
            }
            builder.append(embedding.get(i));
        }
        return builder.append(']').toString();
    }

    private static class NoteRowMapper implements RowMapper<Note> {
        @Override
        public Note mapRow(ResultSet rs, int rowNum) throws SQLException {
            Array array = rs.getArray("tags");
            List<String> tags = new ArrayList<>();
            if (array != null) {
                tags = Arrays.asList((String[]) array.getArray());
            }
            return new Note(
                    (UUID) rs.getObject("id"),
                    (UUID) rs.getObject("user_id"),
                    rs.getString("title"),
                    rs.getString("content"),
                    tags,
                    toOffsetDateTime(rs.getTimestamp("created_at")),
                    toOffsetDateTime(rs.getTimestamp("updated_at"))
            );
        }

        private OffsetDateTime toOffsetDateTime(Timestamp timestamp) {
            return timestamp == null ? null : timestamp.toInstant().atOffset(OffsetDateTime.now().getOffset());
        }
    }
}
