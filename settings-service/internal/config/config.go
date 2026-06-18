// Package config loads application configuration from environment variables.
// All settings have sensible defaults for local development.
package config

import "os"

// Config holds all runtime configuration for the settings-service.
type Config struct {
	// Port the HTTP server will listen on (default: 8083)
	Port string
	// DatabaseURL is the PostgreSQL connection string (postgres://user:pass@host/db)
	DatabaseURL string
}

// Load reads configuration from environment variables and returns a Config.
// Missing variables fall back to dev-friendly defaults.
func Load() *Config {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8083"
	}

	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		// Fallback: matches the docker-compose cortex DB
		dbURL = "postgres://postgres:shannu2612@localhost:5432/cortex?sslmode=disable"
	}

	return &Config{
		Port:        port,
		DatabaseURL: dbURL,
	}
}
