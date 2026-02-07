package validation

import (
	"errors"
	"regexp"
	"strings"
)

var emailRegex = regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)

func ValidateEmail(email string) error {
	email = strings.TrimSpace(email)
	if email == "" {
		return errors.New("email is required")
	}
	if len(email) > 254 {
		return errors.New("email too long")
	}
	if !emailRegex.MatchString(email) {
		return errors.New("invalid email format")
	}
	return nil
}

func ValidateReference(ref string) error {
	ref = strings.TrimSpace(ref)
	if ref == "" {
		return errors.New("reference is required")
	}
	if len(ref) > 100 {
		return errors.New("reference too long")
	}
	if !regexp.MustCompile(`^[a-zA-Z0-9_-]+$`).MatchString(ref) {
		return errors.New("invalid reference format")
	}
	return nil
}

func ValidateAmount(amount int, min, max int) error {
	if amount < min {
		return errors.New("amount too low")
	}
	if amount > max {
		return errors.New("amount too high")
	}
	return nil
}

func SanitizeString(s string) string {
	s = strings.TrimSpace(s)
	s = strings.ReplaceAll(s, "<", "&lt;")
	s = strings.ReplaceAll(s, ">", "&gt;")
	s = strings.ReplaceAll(s, "\"", "&quot;")
	s = strings.ReplaceAll(s, "'", "&#39;")
	return s
}
