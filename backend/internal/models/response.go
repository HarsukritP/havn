package models

// SuccessResponse represents a successful API response
type SuccessResponse struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data"`
	Message string      `json:"message,omitempty"`
}

// ErrorResponse represents an error API response
type ErrorResponse struct {
	Success bool        `json:"success"`
	Error   string      `json:"error"`
	Code    string      `json:"code"`
	Details interface{} `json:"details,omitempty"`
}

// PaginationMeta represents pagination metadata
type PaginationMeta struct {
	CurrentPage int  `json:"current_page"`
	TotalPages  int  `json:"total_pages"`
	TotalItems  int  `json:"total_items"`
	PerPage     int  `json:"per_page"`
	HasNext     bool `json:"has_next"`
	HasPrev     bool `json:"has_prev"`
}

// PaginatedResponse represents a paginated API response
type PaginatedResponse struct {
	Items      interface{}     `json:"items"`
	Pagination *PaginationMeta `json:"pagination"`
}

// AuthResponse represents authentication response data
type AuthResponse struct {
	User  *User  `json:"user"`
	Token string `json:"token"`
}

// HealthCheckResponse represents health check response
type HealthCheckResponse struct {
	Status  string                 `json:"status"`
	Version string                 `json:"version"`
	Services map[string]string     `json:"services"`
}

