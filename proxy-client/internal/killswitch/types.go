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
			Enabled: true,
			Whitelist: []string{
				"127.0.0.1",
				"localhost",
				"10.0.0.0/8",
				"192.168.0.0/16",
			},
		}
	}

	return &Guardian{
		config: config,
	}
}

func (g *Guardian) IsEnabled() bool {
	return g.enabled
}