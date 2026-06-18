// settings-service — entry point
// Wires dependencies, runs DB migrations, starts the Gin HTTP server.
package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/shanmukhraj7/cortex/settings-service/internal/config"
	"github.com/shanmukhraj7/cortex/settings-service/internal/database"
	"github.com/shanmukhraj7/cortex/settings-service/internal/handler"
	"github.com/shanmukhraj7/cortex/settings-service/internal/middleware"
	"github.com/shanmukhraj7/cortex/settings-service/internal/repository"
	"github.com/shanmukhraj7/cortex/settings-service/internal/service"
)

func main() {
	// ── Configuration ────────────────────────────────────────────────────────
	cfg := config.Load()

	// ── Database ─────────────────────────────────────────────────────────────
	db, err := database.Connect(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("settings-service: database connection failed: %v", err)
	}
	defer db.Close()

	if err := database.RunMigrations(db); err != nil {
		log.Fatalf("settings-service: migrations failed: %v", err)
	}

	// ── Dependency graph ─────────────────────────────────────────────────────
	repo := repository.NewSettingsRepository(db)

	settingsSvc := service.NewSettingsService(repo)
	accountSvc := service.NewAccountService(repo)

	settingsH := handler.NewSettingsHandler(settingsSvc)
	accountH := handler.NewAccountHandler(accountSvc)
	dangerH := handler.NewDangerHandler(accountSvc)

	// ── Router ───────────────────────────────────────────────────────────────
	r := gin.Default()

	// Public — no X-User-Id required
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":  "ok",
			"service": "settings-service",
		})
	})

	// Protected — all routes require X-User-Id injected by the API Gateway
	protected := r.Group("/")
	protected.Use(middleware.UserContext())
	{
		// Preference endpoints
		protected.GET("/settings", settingsH.Get)
		protected.PUT("/settings", settingsH.Put)
		protected.PATCH("/settings", settingsH.Patch)
		protected.DELETE("/settings", settingsH.Delete)

		// Account management
		protected.PUT("/settings/account/password", accountH.ChangePassword)

		// Danger zone — irreversible
		protected.DELETE("/settings/account", dangerH.DeleteAccount)
	}

	// ── Start server ─────────────────────────────────────────────────────────
	addr := fmt.Sprintf(":%s", cfg.Port)
	log.Printf("settings-service: listening on %s", addr)
	if err := r.Run(addr); err != nil {
		log.Fatalf("settings-service: server error: %v", err)
	}
}
