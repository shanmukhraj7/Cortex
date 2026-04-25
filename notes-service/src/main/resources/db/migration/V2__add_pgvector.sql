CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE notes ADD COLUMN IF NOT EXISTS embedding vector(1024);

-- We don't index embedding immediately if the table is empty, 
-- but we create the index for production readiness.
-- HNSW is preferred in newer pgvector over ivfflat, but the README mentions ivfflat.
-- We'll use ivfflat as described.
CREATE INDEX IF NOT EXISTS notes_embedding_idx ON notes USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
