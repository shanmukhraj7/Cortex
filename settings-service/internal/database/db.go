// Package database handles PostgreSQL connectivity and schema migrations
// for the settings-service.
package database

import (
	"fmt"
	"log"

	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/postgres"
	"github.com/golang-migrate/migrate/v4/source/iofs"
	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq" // PostgreSQL driver

	"github.com/shanmukhraj7/cortex/settings-service/migrations"
)

// Connect opens a validated sqlx connection to PostgreSQL.
// It pings the server to confirm connectivity before returning.
func Connect(databaseURL string) (*sqlx.DB, error) {
	db, err := sqlx.Connect("postgres", databaseURL)
	if err != nil {
		return nil, fmt.Errorf("database connect: %w", err)
	}

	// Connection pool tuning
	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(5)

	log.Println("database: connected to PostgreSQL")
	return db, nil
}

// RunMigrations applies any pending schema migrations using the SQL files
// embedded in the migrations package at compile time.
// It is idempotent — already-applied migrations are safely skipped.
func RunMigrations(db *sqlx.DB) error {
	// Source: embedded *.sql files from the migrations package
	d, err := iofs.New(migrations.FS, ".")
	if err != nil {
		return fmt.Errorf("migration source: %w", err)
	}

	// Target: the connected PostgreSQL database
	driver, err := postgres.WithInstance(db.DB, &postgres.Config{})
	if err != nil {
		return fmt.Errorf("migration driver: %w", err)
	}

	m, err := migrate.NewWithInstance("iofs", d, "postgres", driver)
	if err != nil {
		return fmt.Errorf("migration init: %w", err)
	}

	if err := m.Up(); err != nil && err != migrate.ErrNoChange {
		return fmt.Errorf("migration up: %w", err)
	}

	log.Println("database: migrations applied successfully")
	return nil
}
