package billing

import (
	"fmt"

	"github.com/rpip/paystack-go"
)

type PaystackProvider struct {
	client *paystack.Client
}

func NewPaystackProvider(apiKey string) *PaystackProvider {
	return &PaystackProvider{
		client: paystack.NewClient(apiKey, nil),
	}
}

func (p *PaystackProvider) CreateCheckout(req CheckoutRequest) (*CheckoutResponse, error) {
	amount := 0
	currency := req.Currency
	if currency == "" {
		currency = "USD"
	}

	// Base USD prices
	usdPrice := 0
	switch req.PlanID {
	case "personal":
		usdPrice = 29
	case "team":
		usdPrice = 99
	case "enterprise":
		usdPrice = 499
	}

	// Convert based on currency (Mock rates)
	switch currency {
	case "NGN":
		amount = usdPrice * 1600 * 100 // 1600 rate, in kobo
	case "GHS":
		amount = usdPrice * 15 * 100 // 15 rate, in pesewas
	default:
		currency = "USD"
		amount = usdPrice * 100 // in cents
	}

	// Create a transaction request
	treq := &paystack.TransactionRequest{
		Amount:   float32(amount),
		Email:    req.Email,
		Currency: currency,
	}

	resp, err := p.client.Transaction.Initialize(treq)
	if err != nil {
		return nil, fmt.Errorf("paystack error: %w", err)
	}

	data, ok := resp["data"].(map[string]interface{})
	if !ok {
		return nil, fmt.Errorf("failed to parse paystack response")
	}

	url, _ := data["authorization_url"].(string)
	return &CheckoutResponse{URL: url, Currency: currency}, nil
}
