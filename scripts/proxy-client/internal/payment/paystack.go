package payment

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
)

type PaystackClient struct {
	SecretKey string
	BaseURL   string
}

type InitializeRequest struct {
	Email    string `json:"email"`
	Amount   int    `json:"amount"` // in kobo (NGN) or cents (USD)
	Currency string `json:"currency"`
	Metadata map[string]interface{} `json:"metadata"`
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

type VerifyResponse struct {
	Status  bool   `json:"status"`
	Message string `json:"message"`
	Data    struct {
		Reference string `json:"reference"`
		Amount    int    `json:"amount"`
		Status    string `json:"status"`
		Customer  struct {
			Email string `json:"email"`
		} `json:"customer"`
		Metadata map[string]interface{} `json:"metadata"`
	} `json:"data"`
}

func NewPaystackClient() *PaystackClient {
	return &PaystackClient{
		SecretKey: os.Getenv("PAYSTACK_SECRET_KEY"),
		BaseURL:   "https://api.paystack.co",
	}
}

func (c *PaystackClient) InitializeTransaction(req InitializeRequest) (*InitializeResponse, error) {
	body, _ := json.Marshal(req)
	
	httpReq, err := http.NewRequest("POST", c.BaseURL+"/transaction/initialize", bytes.NewBuffer(body))
	if err != nil {
		return nil, err
	}
	
	httpReq.Header.Set("Authorization", "Bearer "+c.SecretKey)
	httpReq.Header.Set("Content-Type", "application/json")
	
	client := &http.Client{}
	resp, err := client.Do(httpReq)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	
	respBody, _ := io.ReadAll(resp.Body)
	
	var result InitializeResponse
	if err := json.Unmarshal(respBody, &result); err != nil {
		return nil, err
	}
	
	if !result.Status {
		return nil, fmt.Errorf("paystack error: %s", result.Message)
	}
	
	return &result, nil
}

func (c *PaystackClient) VerifyTransaction(reference string) (*VerifyResponse, error) {
	httpReq, err := http.NewRequest("GET", c.BaseURL+"/transaction/verify/"+reference, nil)
	if err != nil {
		return nil, err
	}
	
	httpReq.Header.Set("Authorization", "Bearer "+c.SecretKey)
	
	client := &http.Client{}
	resp, err := client.Do(httpReq)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	
	respBody, _ := io.ReadAll(resp.Body)
	
	var result VerifyResponse
	if err := json.Unmarshal(respBody, &result); err != nil {
		return nil, err
	}
	
	if !result.Status {
		return nil, fmt.Errorf("paystack error: %s", result.Message)
	}
	
	return &result, nil
}
