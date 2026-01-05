package billing

import (
	"bytes"
	"fmt"
	"time"

	"github.com/go-pdf/fpdf"
)

type InvoiceData struct {
	ID            string
	Date          time.Time
	CustomerName  string
	CustomerEmail string
	Items         []InvoiceItem
	Currency      string
	Symbol        string
	Total         float64
}

type InvoiceItem struct {
	Description string
	Quantity    int
	Price       float64
	Amount      float64
}

func GenerateInvoicePDF(data *InvoiceData) ([]byte, error) {
	pdf := fpdf.New("P", "mm", "A4", "")
	pdf.AddPage()
	pdf.SetFont("Arial", "B", 16)

	// Header
	pdf.Cell(40, 10, "AtlanticProxy Invoice")
	pdf.Ln(12)

	pdf.SetFont("Arial", "", 12)
	pdf.Cell(0, 10, fmt.Sprintf("Invoice #: %s", data.ID))
	pdf.Ln(8)
	pdf.Cell(0, 10, fmt.Sprintf("Date: %s", data.Date.Format("2006-01-02")))
	pdf.Ln(20)

	// Bill To
	pdf.SetFont("Arial", "B", 12)
	pdf.Cell(0, 10, "Bill To:")
	pdf.Ln(8)
	pdf.SetFont("Arial", "", 12)
	if data.CustomerName != "" {
		pdf.Cell(0, 10, data.CustomerName)
		pdf.Ln(6)
	}
	pdf.Cell(0, 10, data.CustomerEmail)
	pdf.Ln(20)

	// Table Header
	pdf.SetFont("Arial", "B", 12)
	pdf.SetFillColor(240, 240, 240)
	pdf.CellFormat(100, 10, "Description", "1", 0, "", true, 0, "")
	pdf.CellFormat(30, 10, "Price", "1", 0, "R", true, 0, "")
	pdf.CellFormat(60, 10, "Amount", "1", 1, "R", true, 0, "")

	// Table Body
	pdf.SetFont("Arial", "", 12)
	for _, item := range data.Items {
		pdf.CellFormat(100, 10, item.Description, "1", 0, "", false, 0, "")
		pdf.CellFormat(30, 10, fmt.Sprintf("%s %.2f", data.Symbol, item.Price), "1", 0, "R", false, 0, "")
		pdf.CellFormat(60, 10, fmt.Sprintf("%s %.2f", data.Symbol, item.Amount), "1", 1, "R", false, 0, "")
	}

	// Total
	pdf.Ln(5)
	pdf.SetFont("Arial", "B", 12)
	pdf.CellFormat(130, 10, "Total", "0", 0, "R", false, 0, "")
	pdf.CellFormat(60, 10, fmt.Sprintf("%s %.2f", data.Symbol, data.Total), "1", 1, "R", true, 0, "")

	// Footer
	pdf.SetY(-30)
	pdf.SetFont("Arial", "I", 8)
	pdf.CellFormat(0, 10, "Thank you for choosing AtlanticProxy.", "0", 1, "C", false, 0, "")
	pdf.CellFormat(0, 10, "AtlanticProxy Inc.", "0", 1, "C", false, 0, "")

	var buf bytes.Buffer
	err := pdf.Output(&buf)
	return buf.Bytes(), err
}
