package proxy

import (
	"fmt"
	"net/http"

	"github.com/elazarl/goproxy"
)

const blockedPageTemplate = `
<!DOCTYPE html>
<html>
<head>
    <title>%s | AtlanticProxy</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #f9fafb; color: #111827; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
        .card { background: white; padding: 40px; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); text-align: center; max-width: 400px; width: 90%%; border: 1px solid #f3f4f6; }
        .icon { font-size: 56px; margin-bottom: 24px; }
        h1 { margin: 0 0 12px; font-size: 24px; font-weight: 700; color: #111827; }
        p { color: #4b5563; line-height: 1.6; margin-bottom: 32px; font-size: 16px; }
        .btn { display: inline-block; background: #2563eb; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; transition: all 0.2s; box-shadow: 0 4px 10px rgba(37, 99, 235, 0.2); }
        .btn:hover { background: #1d4ed8; transform: translateY(-1px); box-shadow: 0 6px 12px rgba(37, 99, 235, 0.25); }
        .footer { margin-top: 40px; font-size: 12px; color: #9ca3af; letter-spacing: 0.05em; text-transform: uppercase; }
        .brand { color: #2563eb; font-weight: 800; }
    </style>
</head>
<body>
    <div class="card">
        <div class="icon">%s</div>
        <h1>%s</h1>
        <p>%s</p>
        <a href="http://localhost:3000/dashboard/billing" class="btn">%s</a>
        <div class="footer">Powered by <span class="brand">AtlanticProxy</span> Guard</div>
    </div>
</body>
</html>
`

func NewBlockedResponse(req *http.Request, title, icon, message, buttonText string, statusCode int) *http.Response {
	html := fmt.Sprintf(blockedPageTemplate, title, icon, title, message, buttonText)
	resp := goproxy.NewResponse(req, "text/html", statusCode, html)
	return resp
}
