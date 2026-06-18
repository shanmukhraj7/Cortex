// Package service contains business logic for the settings-service.
package service

import (
	"encoding/json"
	"fmt"

	"github.com/shanmukhraj7/cortex/settings-service/internal/model"
	"github.com/shanmukhraj7/cortex/settings-service/internal/repository"
)

// SettingsService handles preference CRUD operations.
type SettingsService struct {
	repo *repository.SettingsRepository
}

// NewSettingsService creates a SettingsService using the given repository.
func NewSettingsService(repo *repository.SettingsRepository) *SettingsService {
	return &SettingsService{repo: repo}
}

// Get returns the current settings for userID.
// If no record exists yet, it returns a UserSettings populated with defaults
// (no DB write — defaults are persisted lazily on the first PUT/PATCH).
func (s *SettingsService) Get(userID string) (*model.UserSettings, error) {
	settings, err := s.repo.Get(userID)
	if err != nil {
		return nil, err
	}
	if settings == nil {
		return &model.UserSettings{
			UserID:      userID,
			Preferences: model.DefaultPreferences(),
		}, nil
	}
	return settings, nil
}

// Put fully replaces a user's settings with the provided Preferences.
func (s *SettingsService) Put(userID string, prefs model.Preferences) (*model.UserSettings, error) {
	return s.repo.Upsert(userID, prefs)
}

// Patch applies a partial update to the user's settings.
// Only the fields present in `partial` are changed; all others remain as-is.
// The merge uses a JSON round-trip to cleanly overlay the partial map.
func (s *SettingsService) Patch(userID string, partial map[string]interface{}) (*model.UserSettings, error) {
	// Load current state (or defaults)
	current, err := s.Get(userID)
	if err != nil {
		return nil, err
	}

	// Serialize current preferences to a generic map
	currentBytes, err := json.Marshal(current.Preferences)
	if err != nil {
		return nil, fmt.Errorf("patch marshal: %w", err)
	}
	var currentMap map[string]interface{}
	if err := json.Unmarshal(currentBytes, &currentMap); err != nil {
		return nil, fmt.Errorf("patch unmarshal: %w", err)
	}

	// Overlay partial fields
	for k, v := range partial {
		currentMap[k] = v
	}

	// Deserialize back to typed Preferences
	merged, err := json.Marshal(currentMap)
	if err != nil {
		return nil, fmt.Errorf("patch re-marshal: %w", err)
	}
	var newPrefs model.Preferences
	if err := json.Unmarshal(merged, &newPrefs); err != nil {
		return nil, fmt.Errorf("patch final unmarshal: %w", err)
	}

	return s.repo.Upsert(userID, newPrefs)
}

// Reset deletes the user's settings row, reverting to factory defaults on next GET.
func (s *SettingsService) Reset(userID string) error {
	return s.repo.Delete(userID)
}
