package payment

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
)

type PaystackClient struct {
	secretKey string
	baseURL   string
}

func NewPaystackClient() *PaystackClient {
	return &PaystackClient{
		secretKey: "sk_test_dac14730d4acd736b4a70ebfb24cdeeded8e22d0",
		baseURL:   "https://api.paystack.co",
	}
}

type InitializeRequest struct {
	Email     string `json:"email"`
	Amount    int    `json:"amount"`
	Reference string `json:"reference,omitempty"`
	CallbackURL string `json:"callback_url,omitempty"`
}

type InitializeResponse struct {
	Status  bool   `json:"status"`
	Message string `json:"message"`
	Data    struct {
		AuthorizationURL string `json:"authorization_url"`
		AccessCode       string `json:"access_code"`
		Reference        string `json:"reference"`
	} `json:"data"`
}

func (p *PaystackClient) InitializeTransaction(email string, amount int, reference, callbackURL string) (*InitializeResponse, error) {
	req := InitializeRequest{
		Email:       email,
		Amount:      amount,
		Reference:   reference,
		CallbackURL: callbackURL,
	}

	body, _ := json.Marshal(req)
	httpReq, _ := http.NewRequest("POST", p.baseURL+"/transaction/initialize", bytes.NewBuffer(body))
	httpReq.Header.Set("Authorization", "Bearer "+p.secretKey)
	httpReq.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(httpReq)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var result InitializeResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}

	if !result.Status {
		return nil, fmt.Errorf("paystack error: %s", result.Message)
	}

	return &result, nil
}

type VerifyResponse struct {
	Status  bool   `json:"status"`
	Message string `json:"message"`
	Data    struct {
		Status    string `json:"status"`
		Reference string `json:"reference"`
		Amount    int    `json:"amount"`
		Customer  struct {
			Email string `json:"email"`
		} `json:"customer"`
	} `json:"data"`
}

func (p *PaystackClient) VerifyTransaction(reference string) (*VerifyResponse, error) {
	httpReq, _ := http.NewRequest("GET", p.baseURL+"/transaction/verify/"+reference, nil)
	httpReq.Header.Set("Authorization", "Bearer "+p.secretKey)

	resp, err := http.DefaultClient.Do(httpReq)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var result VerifyResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}

	return &result, nil
}

type RefundRequest struct {
	Transaction string `json:"transaction"`
}

func (p *PaystackClient) RefundTransaction(reference string) error {
	req := RefundRequest{Transaction: reference}
	body, _ := json.Marshal(req)

	httpReq, _ := http.NewRequest("POST", p.baseURL+"/refund", bytes.NewBuffer(body))
	httpReq.Header.Set("Authorization", "Bearer "+p.secretKey)
	httpReq.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(httpReq)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	return nil
}
