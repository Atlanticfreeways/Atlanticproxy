package billing

import "strings"

// CurrencyCode represents a supported currency
type CurrencyCode string

const (
	CurrencyUSD CurrencyCode = "USD"
	CurrencyNGN CurrencyCode = "NGN"
	CurrencyEUR CurrencyCode = "EUR"
	CurrencyGBP CurrencyCode = "GBP"
)

// ExchangeRates holds static rates relative to USD
var ExchangeRates = map[CurrencyCode]float64{
	CurrencyUSD: 1.0,
	CurrencyNGN: 1515.0, // Updated static rate
	CurrencyEUR: 0.92,
	CurrencyGBP: 0.79,
}

// ConvertPrice converts a USD price to the target currency
func ConvertPrice(priceUSD float64, target CurrencyCode) float64 {
	rate, exists := ExchangeRates[target]
	if !exists {
		return priceUSD // Default to USD if unknown
	}
	return priceUSD * rate
}

// GetCurrencySymbol returns the display symbol
func GetCurrencySymbol(c CurrencyCode) string {
	switch c {
	case CurrencyNGN:
		return "₦"
	case CurrencyEUR:
		return "€"
	case CurrencyGBP:
		return "£"
	default:
		return "$"
	}
}

// MapRegionToCurrency returns the likely currency for a country code
func MapRegionToCurrency(countryCode string) CurrencyCode {
	countryCode = strings.ToUpper(countryCode)
	switch countryCode {
	case "NG":
		return CurrencyNGN
	case "GB":
		return CurrencyGBP
	case "DE", "FR", "IT", "ES", "NL", "BE", "AT", "IE", "FI": // Eurozone subset
		return CurrencyEUR
	default:
		return CurrencyUSD
	}
}
