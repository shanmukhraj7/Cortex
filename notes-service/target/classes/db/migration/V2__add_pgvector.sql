CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE notes
    ADD COLUMN IF NOT EXISTS embedding vector(1024);

CREATE INDEX IF NOT EXISTS idx_notes_embedding_cosine
    ON notes USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);
