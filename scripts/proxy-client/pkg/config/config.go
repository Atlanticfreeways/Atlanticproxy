package config

import (
	"os"

	"github.com/atlanticproxy/proxy-client/internal/interceptor"
	"github.com/atlanticproxy/proxy-client/internal/killswitch"
	"github.com/atlanticproxy/proxy-client/internal/monitor"
	"github.com/atlanticproxy/proxy-client/internal/proxy"
	"github.com/joho/godotenv"
	"gopkg.in/yaml.v3"
)

type Config struct {
	Interceptor *interceptor.Config `yaml:"interceptor"`
	Proxy       *proxy.Config       `yaml:"proxy"`
	KillSwitch  *killswitch.Config  `yaml:"killswitch"`
	Monitor     *monitor.Config     `yaml:"monitor"`
	Billing     *BillingConfig      `yaml:"billing"`
	API         *APIConfig          `yaml:"api"`
}

type APIConfig struct {
	Port string `yaml:"port"`
}

type BillingConfig struct {
	PaystackSecretKey string `yaml:"paystack_secret_key"`
}

func Load() *Config {
	// Load .env file if it exists
	_ = godotenv.Load()

	config := &Config{
		Interceptor: &interceptor.Config{
			InterfaceName: "utun9",
			TunIP:         "10.8.0.1",
			TunNetmask:    "255.255.255.0",
		},
		Proxy: &proxy.Config{
			OxylabsUsername: getEnv("OXYLABS_USERNAME", ""),
			OxylabsPassword: getEnv("OXYLABS_PASSWORD", ""),
			OxylabsAPIKey:   getEnv("OXYLABS_API_KEY", ""),
			PiaAPIKey:       getEnv("PIA_API_KEY", ""),
			ProviderType:    getEnv("PROVIDER_TYPE", "auto"),
			ListenAddr:      "127.0.0.1:8080",
			HealthCheckURL:  "https://httpbin.org/ip",
		},
		KillSwitch: &killswitch.Config{
			Enabled: true,
			Whitelist: []string{
				"127.0.0.1",
				"localhost",
				"10.0.0.0/8",
				"192.168.0.0/16",
			},
		},
		Monitor: &monitor.Config{
			CheckInterval: 5,
		},
		Billing: &BillingConfig{
			PaystackSecretKey: getEnv("PAYSTACK_SECRET_KEY", ""),
		},
		API: &APIConfig{
			Port: getEnv("SERVER_PORT", "8082"),
		},
	}

	// Try to load from config file
	if data, err := os.ReadFile("/etc/atlanticproxy/config.yaml"); err == nil {
		yaml.Unmarshal(data, config)
	} else if data, err := os.ReadFile("config.yaml"); err == nil {
		yaml.Unmarshal(data, config)
	}

	// Override with environment variables
	if username := os.Getenv("OXYLABS_USERNAME"); username != "" {
		config.Proxy.OxylabsUsername = username
	}
	if password := os.Getenv("OXYLABS_PASSWORD"); password != "" {
		config.Proxy.OxylabsPassword = password
	}

	return config
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
