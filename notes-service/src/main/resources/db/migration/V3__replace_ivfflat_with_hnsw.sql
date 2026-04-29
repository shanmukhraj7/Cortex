-- Replace the IVFFlat index with HNSW.
-- IVFFlat requires a minimum number of rows (lists × ~40) to build properly;
-- on a new or small table it silently produces a useless index.
-- HNSW works well at any scale and provides better recall out of the box.

DROP INDEX IF EXISTS idx_notes_embedding_cosine;

CREATE INDEX IF NOT EXISTS idx_notes_embedding_hnsw
    ON notes USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);
