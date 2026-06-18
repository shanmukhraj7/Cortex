package service

import (
	"database/sql"
	"errors"
	"fmt"

	"golang.org/x/crypto/bcrypt"

	"github.com/shanmukhraj7/cortex/settings-service/internal/repository"
)

// Sentinel errors returned by AccountService — handlers map these to HTTP status codes.
var (
	ErrInvalidPassword = errors.New("invalid password")
	ErrUserNotFound    = errors.New("user not found")
)

// AccountService handles sensitive account operations:
// password change and full account deletion.
type AccountService struct {
	repo *repository.SettingsRepository
}

// NewAccountService creates an AccountService using the given repository.
func NewAccountService(repo *repository.SettingsRepository) *AccountService {
	return &AccountService{repo: repo}
}

// ChangePassword verifies the user's current password and then replaces the
// bcrypt hash in the shared `users` table with a hash of newPassword.
//
// The bcrypt algorithm matches Spring Security's BCryptPasswordEncoder
// (default cost = 10) so tokens issued by auth-service remain valid.
func (s *AccountService) ChangePassword(userID, currentPassword, newPassword string) error {
	hash, err := s.repo.GetPasswordHash(userID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return ErrUserNotFound
		}
		return fmt.Errorf("change password: %w", err)
	}

	// Verify the supplied current password against the stored hash
	if err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(currentPassword)); err != nil {
		return ErrInvalidPassword
	}

	// Hash the new password (cost 10 = Spring Security default)
	newHash, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("hash new password: %w", err)
	}

	return s.repo.UpdatePasswordHash(userID, string(newHash))
}

// DeleteAccount verifies the user's password as a confirmation step, then
// atomically removes all user data across user_settings, notes, and users tables.
//
// After this call succeeds the JWT the client holds will no longer resolve to
// a valid user row, effectively invalidating it on next auth-service call.
func (s *AccountService) DeleteAccount(userID, password string) error {
	hash, err := s.repo.GetPasswordHash(userID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return ErrUserNotFound
		}
		return fmt.Errorf("delete account: %w", err)
	}

	// Require password confirmation before irreversible deletion
	if err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password)); err != nil {
		return ErrInvalidPassword
	}

	return s.repo.DeleteAccount(userID)
}
