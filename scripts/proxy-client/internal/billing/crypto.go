package billing

import (
	"fmt"
	"time"
)

type CryptoProvider struct {
	apiKey string
}

func NewCryptoProvider(apiKey string) *CryptoProvider {
	return &CryptoProvider{apiKey: apiKey}
}

func (c *CryptoProvider) CreateCheckout(req CheckoutRequest) (*CheckoutResponse, error) {
	amount := 0.0
	switch req.PlanID {
	case "personal":
		amount = 29.0
	case "team":
		amount = 99.0
	case "enterprise":
		amount = 499.0
	default:
		return nil, fmt.Errorf("invalid plan for crypto")
	}

	payCurrency := req.Currency
	if payCurrency == "" {
		payCurrency = "btc"
	}

	// Use Static Addresses provided by user
	// This mode is used for direct P2P payments
	staticAddresses := map[string]string{
		"btc": "bc1q2vvsgycwhf7ne0edq7746g4ppdq3c0sc270ml2",
		"sol": "Ak5kGfQrVqA7YoFgoAk3R7YQ5xeDeuHHmC6wzk2xx9Kj",
		"eth": "0x7913F9112c7793B5e507F368Fc7da503AF666426",
	}

	address, ok := staticAddresses[payCurrency]
	if !ok {
		return nil, fmt.Errorf("unsupported direct crypto: %s", payCurrency)
	}

	// If API Key is present, we could still use NOWPayments for automated tracking,
	// but user has specifically requested these static addresses.
	// For V1, we will show these direct addresses.

	return &CheckoutResponse{
		PaymentID: fmt.Sprintf("DIRECT-%d", time.Now().Unix()),
		Address:   address,
		Amount:    fmt.Sprintf("%.5f", amount), // Real apps would fetch current price, for now USD value
		Currency:  payCurrency,
	}, nil
}
