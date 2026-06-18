// Package migrations embeds SQL migration files into the binary so
// no external filesystem access is required at runtime.
package migrations

import "embed"

// FS holds all *.sql migration files, embedded at compile time.
//
//go:embed *.sql
var FS embed.FS
