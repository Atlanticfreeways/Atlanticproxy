package killswitch

type Config struct {
	Enabled   bool
	Whitelist []string
}

type Guardian struct {
	config  *Config
	enabled bool
}

func New(config *Config) *Guardian {
	if config == nil {
		config = &Config{
			Enabled:   true,
			Whitelist: []string{"10.8.0.0/24"}, // Whitelist local VPN subnet
		}
	}

	return &Guardian{
		config: config,
	}
}

// IsEnabled returns whether the kill switch is currently active
func (g *Guardian) IsEnabled() bool {
	return g.enabled
}
