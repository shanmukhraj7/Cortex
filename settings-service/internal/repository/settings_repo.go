// Package repository provides data-access operations for the settings-service.
// It owns all SQL queries and wraps the database connection.
package repository

import (
	"database/sql"
	"errors"
	"fmt"

	"github.com/jmoiron/sqlx"

	"github.com/shanmukhraj7/cortex/settings-service/internal/model"
)

// SettingsRepository handles all database operations for user settings
// and account management (password, deletion).
type SettingsRepository struct {
	db *sqlx.DB
}

// NewSettingsRepository creates a SettingsRepository backed by the given DB pool.
func NewSettingsRepository(db *sqlx.DB) *SettingsRepository {
	return &SettingsRepository{db: db}
}

// ─── Settings CRUD ────────────────────────────────────────────────────────────

// Get retrieves settings for the given userID.
// Returns (nil, nil) when no row exists — callers should substitute defaults.
func (r *SettingsRepository) Get(userID string) (*model.UserSettings, error) {
	var s model.UserSettings
	err := r.db.QueryRowx(
		`SELECT user_id, settings, updated_at FROM user_settings WHERE user_id = $1`,
		userID,
	).StructScan(&s)

	if errors.Is(err, sql.ErrNoRows) {
		return nil, nil // Not found — caller uses defaults
	}
	if err != nil {
		return nil, fmt.Errorf("settings get: %w", err)
	}
	return &s, nil
}

// Upsert inserts or updates settings for the given userID.
// Returns the persisted UserSettings record.
func (r *SettingsRepository) Upsert(userID string, prefs model.Preferences) (*model.UserSettings, error) {
	var s model.UserSettings
	err := r.db.QueryRowx(`
		INSERT INTO user_settings (user_id, settings, updated_at)
		VALUES ($1, $2, NOW())
		ON CONFLICT (user_id) DO UPDATE
		    SET settings   = EXCLUDED.settings,
		        updated_at = NOW()
		RETURNING user_id, settings, updated_at`,
		userID, prefs,
	).StructScan(&s)
	if err != nil {
		return nil, fmt.Errorf("settings upsert: %w", err)
	}
	return &s, nil
}

// Delete removes the settings row for userID (reset to defaults).
// It is a no-op if no row exists.
func (r *SettingsRepository) Delete(userID string) error {
	_, err := r.db.Exec(`DELETE FROM user_settings WHERE user_id = $1`, userID)
	if err != nil {
		return fmt.Errorf("settings delete: %w", err)
	}
	return nil
}

// ─── Account Management ───────────────────────────────────────────────────────

// GetPasswordHash fetches the bcrypt password hash from the shared users table.
// Returns sql.ErrNoRows if the user does not exist.
func (r *SettingsRepository) GetPasswordHash(userID string) (string, error) {
	var hash string
	err := r.db.QueryRow(
		`SELECT password_hash FROM users WHERE id = $1::uuid`, userID,
	).Scan(&hash)
	if err != nil {
		return "", fmt.Errorf("get password hash: %w", err)
	}
	return hash, nil
}

// UpdatePasswordHash writes a new bcrypt hash to the users table.
func (r *SettingsRepository) UpdatePasswordHash(userID, newHash string) error {
	_, err := r.db.Exec(
		`UPDATE users SET password_hash = $1 WHERE id = $2::uuid`,
		newHash, userID,
	)
	if err != nil {
		return fmt.Errorf("update password hash: %w", err)
	}
	return nil
}

// ─── Danger Zone ──────────────────────────────────────────────────────────────

// DeleteAccount hard-deletes all data for userID in a single atomic transaction:
//  1. user_settings  (this service's own data)
//  2. notes          (owned by notes-service — shares the same DB)
//  3. users          (owned by auth-service — parent row deleted last)
//
// Deleting `notes` also removes the pgvector embedding column values,
// so no separate call to ml-service is needed.
func (r *SettingsRepository) DeleteAccount(userID string) error {
	tx, err := r.db.Begin()
	if err != nil {
		return fmt.Errorf("begin transaction: %w", err)
	}
	defer tx.Rollback() //nolint:errcheck — superseded by Commit on success

	steps := []struct {
		query string
		label string
	}{
		{`DELETE FROM user_settings WHERE user_id = $1`, "delete user_settings"},
		{`DELETE FROM notes WHERE user_id = $1::uuid`, "delete notes"},
		{`DELETE FROM users WHERE id = $1::uuid`, "delete user"},
	}

	for _, step := range steps {
		if _, err := tx.Exec(step.query, userID); err != nil {
			return fmt.Errorf("%s: %w", step.label, err)
		}
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("commit account deletion: %w", err)
	}
	return nil
}
