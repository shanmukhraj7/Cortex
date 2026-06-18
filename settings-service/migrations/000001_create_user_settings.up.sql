-- 000001_create_user_settings.up.sql
-- Stores per-user preferences as a flexible JSONB blob.
-- No FK to users — cascade delete is handled programmatically
-- in a single transaction by the settings-service.

CREATE TABLE IF NOT EXISTS user_settings (
    user_id    UUID         PRIMARY KEY,
    settings   JSONB        NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
