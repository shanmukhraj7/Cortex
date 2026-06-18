// Package model defines the data structures used across the settings-service.
package model

import (
	"database/sql/driver"
	"encoding/json"
	"fmt"
	"time"
)

// Preferences holds all user-configurable settings stored as a JSONB blob.
type Preferences struct {
	// Display / Theme
	Theme       string `json:"theme"`       // "dark" | "light" | "system"
	AccentColor string `json:"accentColor"` // hex e.g. "#7C3AED"
	FontSize    string `json:"fontSize"`    // "sm" | "md" | "lg"

	// Notification Preferences
	EmailDigest   bool `json:"emailDigest"`   // daily email digest toggle
	WeeklySummary bool `json:"weeklySummary"` // weekly summary email toggle
}

// DefaultPreferences returns the factory-default settings applied when no
// record exists for a user yet.
func DefaultPreferences() Preferences {
	return Preferences{
		Theme:         "dark",
		AccentColor:   "#7C3AED",
		FontSize:      "md",
		EmailDigest:   false,
		WeeklySummary: false,
	}
}

// Value implements driver.Valuer so sqlx can serialize Preferences to JSONB.
func (p Preferences) Value() (driver.Value, error) {
	b, err := json.Marshal(p)
	if err != nil {
		return nil, fmt.Errorf("preferences marshal: %w", err)
	}
	return string(b), nil
}

// Scan implements sql.Scanner so sqlx can deserialize JSONB back to Preferences.
func (p *Preferences) Scan(value interface{}) error {
	var bytes []byte
	switch v := value.(type) {
	case []byte:
		bytes = v
	case string:
		bytes = []byte(v)
	default:
		return fmt.Errorf("cannot scan type %T into Preferences", value)
	}
	return json.Unmarshal(bytes, p)
}

// UserSettings is the full settings record for a user.
type UserSettings struct {
	UserID      string      `db:"user_id"    json:"userId"`
	Preferences Preferences `db:"settings"   json:"preferences"`
	UpdatedAt   time.Time   `db:"updated_at" json:"updatedAt"`
}
