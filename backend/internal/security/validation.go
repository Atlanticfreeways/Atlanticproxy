package security

import (
	"fmt"
	"log"
	"regexp"
	"strings"
	"unicode"
)

// ValidateEmail validates email format
func ValidateEmail(email string) error {
	if email == "" {
		return fmt.Errorf("email is required")
	}

	if len(email) > 255 {
		return fmt.Errorf("email is too long")
	}

	// Simple email validation
	emailRegex := regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
	if !emailRegex.MatchString(email) {
		return fmt.Errorf("invalid email format")
	}

	return nil
}

// ValidatePassword validates password strength
func ValidatePassword(password string) error {
	if password == "" {
		return fmt.Errorf("password is required")
	}

	if len(password) < 8 {
		return fmt.Errorf("password must be at least 8 characters")
	}

	if len(password) > 128 {
		return fmt.Errorf("password is too long")
	}

	// Check for uppercase
	hasUpper := false
	for _, r := range password {
		if unicode.IsUpper(r) {
			hasUpper = true
			break
		}
	}

	if !hasUpper {
		return fmt.Errorf("password must contain at least one uppercase letter")
	}

	// Check for lowercase
	hasLower := false
	for _, r := range password {
		if unicode.IsLower(r) {
			hasLower = true
			break
		}
	}

	if !hasLower {
		return fmt.Errorf("password must contain at least one lowercase letter")
	}

	// Check for digit
	hasDigit := false
	for _, r := range password {
		if unicode.IsDigit(r) {
			hasDigit = true
			break
		}
	}

	if !hasDigit {
		return fmt.Errorf("password must contain at least one digit")
	}

	return nil
}

// SanitizeInput removes potentially dangerous characters
func SanitizeInput(input string) string {
	// Remove null bytes
	input = strings.ReplaceAll(input, "\x00", "")

	// Remove control characters
	input = strings.Map(func(r rune) rune {
		if r < 32 && r != '\n' && r != '\r' && r != '\t' {
			return -1
		}
		return r
	}, input)

	// Trim whitespace
	input = strings.TrimSpace(input)

	return input
}

// SanitizeSQL prevents SQL injection
func SanitizeSQL(input string) string {
	// Remove SQL keywords and dangerous characters
	dangerous := []string{"'", "\"", ";", "--", "/*", "*/", "xp_", "sp_"}

	for _, d := range dangerous {
		if strings.Contains(strings.ToLower(input), strings.ToLower(d)) {
			log.Printf("⚠️  Potentially dangerous SQL detected: %s", d)
			return ""
		}
	}

	return input
}

// SanitizeHTML prevents XSS attacks
func SanitizeHTML(input string) string {
	// Remove HTML tags
	htmlRegex := regexp.MustCompile(`<[^>]*>`)
	input = htmlRegex.ReplaceAllString(input, "")

	// Remove script tags
	scriptRegex := regexp.MustCompile(`(?i)<script[^>]*>.*?</script>`)
	input = scriptRegex.ReplaceAllString(input, "")

	// Remove event handlers
	eventRegex := regexp.MustCompile(`(?i)on\w+\s*=`)
	input = eventRegex.ReplaceAllString(input, "")

	// Escape HTML entities
	input = strings.ReplaceAll(input, "&", "&amp;")
	input = strings.ReplaceAll(input, "<", "&lt;")
	input = strings.ReplaceAll(input, ">", "&gt;")
	input = strings.ReplaceAll(input, "\"", "&quot;")
	input = strings.ReplaceAll(input, "'", "&#x27;")

	return input
}

// ValidateIPAddress validates IP address format
func ValidateIPAddress(ip string) error {
	if ip == "" {
		return fmt.Errorf("IP address is required")
	}

	// Simple IP validation
	ipRegex := regexp.MustCompile(`^(\d{1,3}\.){3}\d{1,3}$`)
	if !ipRegex.MatchString(ip) {
		return fmt.Errorf("invalid IP address format")
	}

	return nil
}

// ValidateURL validates URL format
func ValidateURL(url string) error {
	if url == "" {
		return fmt.Errorf("URL is required")
	}

	if len(url) > 2048 {
		return fmt.Errorf("URL is too long")
	}

	// Simple URL validation
	urlRegex := regexp.MustCompile(`^https?://[^\s/$.?#].[^\s]*$`)
	if !urlRegex.MatchString(url) {
		return fmt.Errorf("invalid URL format")
	}

	return nil
}

// ValidatePhoneNumber validates phone number format
func ValidatePhoneNumber(phone string) error {
	if phone == "" {
		return fmt.Errorf("phone number is required")
	}

	// Remove non-digit characters
	digits := regexp.MustCompile(`\D`).ReplaceAllString(phone, "")

	if len(digits) < 10 || len(digits) > 15 {
		return fmt.Errorf("invalid phone number format")
	}

	return nil
}

// ValidateAmount validates monetary amount
func ValidateAmount(amount float64) error {
	if amount <= 0 {
		return fmt.Errorf("amount must be greater than 0")
	}

	if amount > 999999.99 {
		return fmt.Errorf("amount is too large")
	}

	return nil
}

// ValidateLength validates string length
func ValidateLength(input string, minLen, maxLen int) error {
	if len(input) < minLen {
		return fmt.Errorf("input is too short (minimum %d characters)", minLen)
	}

	if len(input) > maxLen {
		return fmt.Errorf("input is too long (maximum %d characters)", maxLen)
	}

	return nil
}

// ValidateAlphanumeric validates alphanumeric string
func ValidateAlphanumeric(input string) error {
	alphanumericRegex := regexp.MustCompile(`^[a-zA-Z0-9]+$`)
	if !alphanumericRegex.MatchString(input) {
		return fmt.Errorf("input must contain only alphanumeric characters")
	}

	return nil
}

// ValidateUUID validates UUID format
func ValidateUUID(uuid string) error {
	uuidRegex := regexp.MustCompile(`^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$`)
	if !uuidRegex.MatchString(strings.ToLower(uuid)) {
		return fmt.Errorf("invalid UUID format")
	}

	return nil
}
