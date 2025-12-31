package billing

type PaymentMethod string

const (
	MethodPaystack PaymentMethod = "paystack"
	MethodCrypto   PaymentMethod = "crypto"
)

type CheckoutRequest struct {
	PlanID   string        `json:"plan_id" binding:"required"`
	Email    string        `json:"email" binding:"required"`
	Method   PaymentMethod `json:"method" binding:"required"`
	Currency string        `json:"currency"` // e.g. "USD", "NGN", "GHS"
}

type CheckoutResponse struct {
	URL       string `json:"url,omitempty"`
	PaymentID string `json:"payment_id,omitempty"`
	Address   string `json:"address,omitempty"` // For Crypto
	Amount    string `json:"amount,omitempty"`  // For Crypto
	Currency  string `json:"currency,omitempty"`
}

type PaymentGateway interface {
	CreateCheckout(req CheckoutRequest) (*CheckoutResponse, error)
}
