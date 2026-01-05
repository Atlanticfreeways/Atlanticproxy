package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// ProtocolCredentials exposes the connection details for manual proxy usage
type ProtocolCredentials struct {
	Socks5 struct {
		Host     string `json:"host"`
		Port     int    `json:"port"`
		Username string `json:"username,omitempty"`
		Password string `json:"password,omitempty"`
	} `json:"socks5"`
	Shadowsocks struct {
		Host     string `json:"host"`
		Port     int    `json:"port"`
		Method   string `json:"method"`
		Password string `json:"password"`
		URI      string `json:"uri"` // ss:// link
	} `json:"shadowsocks"`
}

func (s *Server) handleGetProtocolCredentials(c *gin.Context) {
	// In the future, these could be configurable or rotated dynamically
	creds := ProtocolCredentials{}

	// SOCKS5: Standard residential access
	creds.Socks5.Host = "127.0.0.1"
	creds.Socks5.Port = 1080
	// No auth required for local SOCKS5 binding in MVP, but we can add if needed later.

	// Shadowsocks: Premium obfuscation
	creds.Shadowsocks.Host = "127.0.0.1" // Exposed on 0.0.0.0 but accessed locally via loopback usually
	creds.Shadowsocks.Port = 8388
	creds.Shadowsocks.Method = "chacha20-ietf-poly1305"
	creds.Shadowsocks.Password = "proxy-secret" // Match engine.go
	// ss://METHOD:PASSWORD@HOST:PORT
	// Note: URI encoding usually required for base64 parts, but for MVP standard string:
	creds.Shadowsocks.URI = "ss://Y2hhY2hhMjAtaWV0Zi1wb2x5MTMwNTpwcm94eS1zZWNyZXQ=@127.0.0.1:8388#AtlanticProxy"

	c.JSON(http.StatusOK, creds)
}
