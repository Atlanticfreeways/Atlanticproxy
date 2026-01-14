package providers

import (
	"context"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"strings"
	"sync"
	"time"

	"github.com/atlanticproxy/proxy-client/pkg/oxylabs"
	"github.com/atlanticproxy/proxy-client/pkg/oxylabs/realtime"
)

type ProviderType string

const (
	TypeResidential ProviderType = "residential"
	TypeRealtime    ProviderType = "realtime"
	TypePIA         ProviderType = "pia"
)

var (
	ErrUseAdapter = errors.New("use adapter")
)

// Provider interface
type Provider interface {
	Type() ProviderType
}

// ResidentialProvider interface
type ResidentialProvider interface {
	Provider
	GetProxy(ctx context.Context, config oxylabs.ProxyConfig) (*url.URL, error)
}

// RealtimeProvider interface
type RealtimeProvider interface {
	Provider
	FetchURL(ctx context.Context, url string, config oxylabs.ProxyConfig) (*http.Response, error)
}

// PIAProvider implements the PIA S5 Proxy API extraction
type PIAProvider struct {
	APIKey  string
	BaseURL string
	client  *http.Client
}

func NewPIAProvider(apiKey string) *PIAProvider {
	return &PIAProvider{
		APIKey:  apiKey,
		BaseURL: "https://www.piaproxy.com/api/get_ip",
		client:  &http.Client{Timeout: 15 * time.Second},
	}
}

func (p *PIAProvider) Type() ProviderType { return TypePIA }

func (p *PIAProvider) GetProxy(ctx context.Context, config oxylabs.ProxyConfig) (*url.URL, error) {
	// Standard PIA S5 API URL for IP extraction
	target := fmt.Sprintf("%s?apikey=%s&num=1&type=text&country=%s", p.BaseURL, p.APIKey, config.Country)

	req, err := http.NewRequestWithContext(ctx, "GET", target, nil)
	if err != nil {
		return nil, err
	}

	resp, err := p.client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	ipPort := string(body)
	if strings.Contains(ipPort, "error") || strings.Contains(ipPort, "code") {
		return nil, fmt.Errorf("PIA API error: %s", ipPort)
	}

	// Clean whitespace
	ipPort = strings.TrimSpace(ipPort)
	if ipPort == "" {
		return nil, errors.New("PIA API returned empty response")
	}

	return &url.URL{
		Scheme: "http", // Or socks5 depending on PIA config, but standard is http/socks5
		Host:   ipPort,
	}, nil
}

// Wrapper structs to satisfy interfaces
type OxylabsResidential struct {
	Client *oxylabs.Client
}

func (p *OxylabsResidential) Type() ProviderType { return TypeResidential }
func (p *OxylabsResidential) GetProxy(ctx context.Context, config oxylabs.ProxyConfig) (*url.URL, error) {
	if config.SessionID != "" || config.Country != "" {
		return p.Client.GetProxyWithConfig(ctx, config)
	}
	return p.Client.GetProxy(ctx)
}

type OxylabsRealtime struct {
	Client *realtime.Client
}

func (p *OxylabsRealtime) Type() ProviderType { return TypeRealtime }
func (p *OxylabsRealtime) FetchURL(ctx context.Context, url string, config oxylabs.ProxyConfig) (*http.Response, error) {
	return p.Client.FetchURL(ctx, url, config)
}

type Manager struct {
	mu             sync.RWMutex
	providers      map[string]Provider
	activeProvider string
}

func NewManager() *Manager {
	return &Manager{
		providers: make(map[string]Provider),
	}
}

func (m *Manager) RegisterProvider(name string, provider Provider) {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.providers[name] = provider
}

func (m *Manager) SetActive(name string) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	if _, ok := m.providers[name]; !ok {
		return errors.New("provider not found")
	}
	m.activeProvider = name
	log.Printf("[ProviderManager] Active provider set to: %s", name)
	return nil
}

func (m *Manager) GetActiveProvider() Provider {
	m.mu.RLock()
	defer m.mu.RUnlock()
	return m.providers[m.activeProvider]
}

// GetProxy either returns a proxy URL (for residential) or ErrUseAdapter (for realtime)
func (m *Manager) GetProxy(ctx context.Context, config oxylabs.ProxyConfig) (*url.URL, error) {
	provider := m.GetActiveProvider()
	if provider == nil {
		return nil, errors.New("no active provider")
	}

	switch p := provider.(type) {
	case ResidentialProvider:
		return p.GetProxy(ctx, config)
	case RealtimeProvider:
		return nil, ErrUseAdapter
	default:
		return nil, errors.New("unknown provider type")
	}
}
