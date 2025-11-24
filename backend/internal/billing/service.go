package billing

import (
	"fmt"
	"time"

	"github.com/jmoiron/sqlx"
)

type BillingService struct {
	db *sqlx.DB
}

type Subscription struct {
	ID           int       `json:"id" db:"id"`
	UserID       int       `json:"user_id" db:"user_id"`
	Tier         string    `json:"tier" db:"tier"`
	Status       string    `json:"status" db:"status"`
	StartDate    time.Time `json:"start_date" db:"start_date"`
	MonthlyLimit int64     `json:"monthly_limit" db:"monthly_limit"`
}

type Invoice struct {
	ID        int       `json:"id" db:"id"`
	UserID    int       `json:"user_id" db:"user_id"`
	Amount    float64   `json:"amount" db:"amount"`
	Usage     int64     `json:"usage" db:"usage"`
	Period    string    `json:"period" db:"period"`
	Status    string    `json:"status" db:"status"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
}

func NewBillingService(db *sqlx.DB) *BillingService {
	return &BillingService{db: db}
}

func (b *BillingService) GetUserSubscription(userID int) (*Subscription, error) {
	var sub Subscription
	err := b.db.Get(&sub, `
		SELECT 1 as id, $1 as user_id, 'free' as tier, 'active' as status, 
		       NOW() as start_date, 1073741824 as monthly_limit
	`, userID)
	
	return &sub, err
}

func (b *BillingService) GenerateInvoice(userID int, usage int64) (*Invoice, error) {
	invoice := &Invoice{
		UserID: userID,
		Amount: 0, // Free tier
		Usage:  usage,
		Period: time.Now().Format("2006-01"),
		Status: "paid",
		CreatedAt: time.Now(),
	}
	
	return invoice, nil
}