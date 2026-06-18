package model

// APIError is the standard JSON error body returned by all endpoints.
type APIError struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
}
