package encryption

import (
	"fmt"
	"log"
	"time"

	"github.com/jmoiron/sqlx"
)

type KeyRotation struct {
	db *sqlx.DB
}

// NewKeyRotation creates a new key rotation manager
func NewKeyRotation(db *sqlx.DB) *KeyRotation {
	return &KeyRotation{db: db}
}

// RotateKeys re-encrypts all data with a new key
func (kr *KeyRotation) RotateKeys(oldEncryptor, newEncryptor *Encryptor) error {
	tx, err := kr.db.Beginx()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	// Rotate API keys
	rows, err := tx.Queryx("SELECT id, key_encrypted FROM api_keys")
	if err != nil {
		log.Printf("Warning: Failed to query api_keys: %v", err)
	} else {
		defer rows.Close()
		for rows.Next() {
			var id int
			var encryptedData string

			err := rows.Scan(&id, &encryptedData)
			if err != nil {
				log.Printf("Warning: Failed to scan api_key: %v", err)
				continue
			}

			plaintext, err := oldEncryptor.Decrypt(encryptedData)
			if err != nil {
				log.Printf("Warning: Failed to decrypt api_key %d: %v", id, err)
				continue
			}

			newEncrypted, err := newEncryptor.Encrypt(plaintext)
			if err != nil {
				log.Printf("Warning: Failed to encrypt api_key %d: %v", id, err)
				continue
			}

			_, err = tx.Exec(
				"UPDATE api_keys SET key_encrypted = $1, rotated_at = $2 WHERE id = $3",
				newEncrypted, time.Now(), id,
			)
			if err != nil {
				log.Printf("Warning: Failed to update api_key %d: %v", id, err)
			}
		}
	}

	// Rotate payment data
	rows, err = tx.Queryx("SELECT id, data_encrypted FROM encrypted_data WHERE data_type = 'payment'")
	if err != nil {
		log.Printf("Warning: Failed to query encrypted_data: %v", err)
	} else {
		defer rows.Close()
		for rows.Next() {
			var id int
			var encryptedData string

			err := rows.Scan(&id, &encryptedData)
			if err != nil {
				log.Printf("Warning: Failed to scan encrypted_data: %v", err)
				continue
			}

			plaintext, err := oldEncryptor.Decrypt(encryptedData)
			if err != nil {
				log.Printf("Warning: Failed to decrypt encrypted_data %d: %v", id, err)
				continue
			}

			newEncrypted, err := newEncryptor.Encrypt(plaintext)
			if err != nil {
				log.Printf("Warning: Failed to encrypt encrypted_data %d: %v", id, err)
				continue
			}

			_, err = tx.Exec(
				"UPDATE encrypted_data SET data_encrypted = $1, rotated_at = $2 WHERE id = $3",
				newEncrypted, time.Now(), id,
			)
			if err != nil {
				log.Printf("Warning: Failed to update encrypted_data %d: %v", id, err)
			}
		}
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	log.Println("✅ Key rotation completed successfully")
	return nil
}

// GetRotationStatus returns the status of key rotation
func (kr *KeyRotation) GetRotationStatus() (map[string]interface{}, error) {
	status := make(map[string]interface{})

	// Count unrotated API keys
	var unrotatedAPIKeys int
	err := kr.db.Get(&unrotatedAPIKeys, "SELECT COUNT(*) FROM api_keys WHERE rotated_at IS NULL")
	if err != nil {
		log.Printf("Warning: Failed to count unrotated API keys: %v", err)
	}
	status["unrotated_api_keys"] = unrotatedAPIKeys

	// Count unrotated encrypted data
	var unrotatedData int
	err = kr.db.Get(&unrotatedData, "SELECT COUNT(*) FROM encrypted_data WHERE rotated_at IS NULL")
	if err != nil {
		log.Printf("Warning: Failed to count unrotated encrypted data: %v", err)
	}
	status["unrotated_encrypted_data"] = unrotatedData

	// Get last rotation time
	var lastRotation *time.Time
	err = kr.db.Get(&lastRotation, "SELECT MAX(rotated_at) FROM api_keys")
	if err == nil && lastRotation != nil {
		status["last_rotation"] = lastRotation
	}

	return status, nil
}
