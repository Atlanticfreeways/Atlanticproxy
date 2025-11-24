package paystack

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"

	"github.com/jmoiron/sqlx"
)

const (
	PaystackBaseURL = "https://api.paystack.co"
)

type PaystackService struct {
	db        *sqlx.DB
	secretKey string
	client    *http.Client
}

// NewPaystackService creates a new Paystack service
func NewPaystackService(db *sqlx.DB, secretKey string) *PaystackService {
	return &PaystackService{
		db:        db,
		secretKey: secretKey,
		client:    &http.Client{},
	}
}

// InitializeTransaction initializes a Paystack transaction
func (s *PaystackService) InitializeTransaction(email string, amount int, reference string) (map[string]interface{}, error) {
	payload := map[string]interface{}{
		"email":      email,
		"amount":     amount,
		"reference":  reference,
	}

	body, err := json.Marshal(payload)
	if err != nil {
		log.Printf("❌ Failed to marshal payload: %v", err)
		return nil, err
	}

	req, err := http.NewRequest("POST", PaystackBaseURL+"/transaction/initialize", bytes.NewBuffer(body))
	if err != nil {
		log.Printf("❌ Failed to create request: %v", err)
		return nil, err
	}

	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", s.secretKey))
	req.Header.Set("Content-Type", "application/json")

	resp, err := s.client.Do(req)
	if err != nil {
		log.Printf("❌ Failed to initialize transaction: %v", err)
		return nil, err
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Printf("❌ Failed to read response: %v", err)
		return nil, err
	}

	var result map[string]interface{}
	err = json.Unmarshal(respBody, &result)
	if err != nil {
		log.Printf("❌ Failed to unmarshal response: %v", err)
		return nil, err
	}

	log.Printf("✅ Transaction initialized: %s", reference)
	return result, nil
}

// VerifyTransaction verifies a Paystack transaction
func (s *PaystackService) VerifyTransaction(reference string) (map[string]interface{}, error) {
	req, err := http.NewRequest("GET", fmt.Sprintf("%s/transaction/verify/%s", PaystackBaseURL, reference), nil)
	if err != nil {
		log.Printf("❌ Failed to create request: %v", err)
		return nil, err
	}

	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", s.secretKey))

	resp, err := s.client.Do(req)
	if err != nil {
		log.Printf("❌ Failed to verify transaction: %v", err)
		return nil, err
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Printf("❌ Failed to read response: %v", err)
		return nil, err
	}

	var result map[string]interface{}
	err = json.Unmarshal(respBody, &result)
	if err != nil {
		log.Printf("❌ Failed to unmarshal response: %v", err)
		return nil, err
	}

	log.Printf("✅ Transaction verified: %s", reference)
	return result, nil
}

// CreatePlan creates a Paystack subscription plan
func (s *PaystackService) CreatePlan(name string, description string, amount int, interval string) (map[string]interface{}, error) {
	payload := map[string]interface{}{
		"name":        name,
		"description": description,
		"amount":      amount,
		"interval":    interval,
	}

	body, err := json.Marshal(payload)
	if err != nil {
		log.Printf("❌ Failed to marshal payload: %v", err)
		return nil, err
	}

	req, err := http.NewRequest("POST", PaystackBaseURL+"/plan", bytes.NewBuffer(body))
	if err != nil {
		log.Printf("❌ Failed to create request: %v", err)
		return nil, err
	}

	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", s.secretKey))
	req.Header.Set("Content-Type", "application/json")

	resp, err := s.client.Do(req)
	if err != nil {
		log.Printf("❌ Failed to create plan: %v", err)
		return nil, err
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Printf("❌ Failed to read response: %v", err)
		return nil, err
	}

	var result map[string]interface{}
	err = json.Unmarshal(respBody, &result)
	if err != nil {
		log.Printf("❌ Failed to unmarshal response: %v", err)
		return nil, err
	}

	log.Printf("✅ Plan created: %s", name)
	return result, nil
}

// CreateSubscription creates a Paystack subscription
func (s *PaystackService) CreateSubscription(email string, planCode string, authorizationCode string) (map[string]interface{}, error) {
	payload := map[string]interface{}{
		"customer":             email,
		"plan":                 planCode,
		"authorization":        authorizationCode,
	}

	body, err := json.Marshal(payload)
	if err != nil {
		log.Printf("❌ Failed to marshal payload: %v", err)
		return nil, err
	}

	req, err := http.NewRequest("POST", PaystackBaseURL+"/subscription", bytes.NewBuffer(body))
	if err != nil {
		log.Printf("❌ Failed to create request: %v", err)
		return nil, err
	}

	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", s.secretKey))
	req.Header.Set("Content-Type", "application/json")

	resp, err := s.client.Do(req)
	if err != nil {
		log.Printf("❌ Failed to create subscription: %v", err)
		return nil, err
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Printf("❌ Failed to read response: %v", err)
		return nil, err
	}

	var result map[string]interface{}
	err = json.Unmarshal(respBody, &result)
	if err != nil {
		log.Printf("❌ Failed to unmarshal response: %v", err)
		return nil, err
	}

	log.Printf("✅ Subscription created: %s", email)
	return result, nil
}

// DisableSubscription disables a Paystack subscription
func (s *PaystackService) DisableSubscription(code string, token string) (map[string]interface{}, error) {
	payload := map[string]interface{}{
		"token": token,
	}

	body, err := json.Marshal(payload)
	if err != nil {
		log.Printf("❌ Failed to marshal payload: %v", err)
		return nil, err
	}

	req, err := http.NewRequest("POST", fmt.Sprintf("%s/subscription/%s/disable", PaystackBaseURL, code), bytes.NewBuffer(body))
	if err != nil {
		log.Printf("❌ Failed to create request: %v", err)
		return nil, err
	}

	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", s.secretKey))
	req.Header.Set("Content-Type", "application/json")

	resp, err := s.client.Do(req)
	if err != nil {
		log.Printf("❌ Failed to disable subscription: %v", err)
		return nil, err
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Printf("❌ Failed to read response: %v", err)
		return nil, err
	}

	var result map[string]interface{}
	err = json.Unmarshal(respBody, &result)
	if err != nil {
		log.Printf("❌ Failed to unmarshal response: %v", err)
		return nil, err
	}

	log.Printf("✅ Subscription disabled: %s", code)
	return result, nil
}
