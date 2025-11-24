package encryption

import (
	"testing"
)

func TestEncryptDecrypt(t *testing.T) {
	encryptor, err := NewEncryptor("my-secret-key-32-bytes-long!!!")
	if err != nil {
		t.Fatalf("Failed to create encryptor: %v", err)
	}

	plaintext := "sensitive data"
	encrypted, err := encryptor.Encrypt(plaintext)
	if err != nil {
		t.Fatalf("Failed to encrypt: %v", err)
	}

	if encrypted == "" {
		t.Fatal("Encrypted data is empty")
	}

	decrypted, err := encryptor.Decrypt(encrypted)
	if err != nil {
		t.Fatalf("Failed to decrypt: %v", err)
	}

	if decrypted != plaintext {
		t.Errorf("Expected %s, got %s", plaintext, decrypted)
	}
}

func TestEncryptMultipleTimes(t *testing.T) {
	encryptor, err := NewEncryptor("test-key-for-multiple-encryptions")
	if err != nil {
		t.Fatalf("Failed to create encryptor: %v", err)
	}

	plaintext := "test data"
	encrypted1, err := encryptor.Encrypt(plaintext)
	if err != nil {
		t.Fatalf("First encryption failed: %v", err)
	}

	encrypted2, err := encryptor.Encrypt(plaintext)
	if err != nil {
		t.Fatalf("Second encryption failed: %v", err)
	}

	// Encrypted values should be different due to random nonce
	if encrypted1 == encrypted2 {
		t.Error("Two encryptions of same plaintext should produce different ciphertexts")
	}

	// But both should decrypt to same plaintext
	decrypted1, _ := encryptor.Decrypt(encrypted1)
	decrypted2, _ := encryptor.Decrypt(encrypted2)

	if decrypted1 != plaintext || decrypted2 != plaintext {
		t.Error("Both decryptions should produce original plaintext")
	}
}

func TestDecryptInvalidData(t *testing.T) {
	encryptor, err := NewEncryptor("test-key")
	if err != nil {
		t.Fatalf("Failed to create encryptor: %v", err)
	}

	_, err = encryptor.Decrypt("invalid-base64-data!!!")
	if err == nil {
		t.Error("Should fail on invalid base64 data")
	}
}

func TestKeyPadding(t *testing.T) {
	// Test with short key
	encryptor1, err := NewEncryptor("short")
	if err != nil {
		t.Fatalf("Failed to create encryptor with short key: %v", err)
	}

	plaintext := "test"
	encrypted, err := encryptor1.Encrypt(plaintext)
	if err != nil {
		t.Fatalf("Failed to encrypt: %v", err)
	}

	decrypted, err := encryptor1.Decrypt(encrypted)
	if err != nil {
		t.Fatalf("Failed to decrypt: %v", err)
	}

	if decrypted != plaintext {
		t.Errorf("Expected %s, got %s", plaintext, decrypted)
	}
}
