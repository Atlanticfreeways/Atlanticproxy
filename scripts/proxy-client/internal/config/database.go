package config

import (
	"database/sql"
	"os"
	"time"
)

type DBConfig struct {
	MaxOpenConns    int
	MaxIdleConns    int
	ConnMaxLifetime time.Duration
	ConnMaxIdleTime time.Duration
}

func GetDBConfig() *DBConfig {
	return &DBConfig{
		MaxOpenConns:    25,
		MaxIdleConns:    5,
		ConnMaxLifetime: 5 * time.Minute,
		ConnMaxIdleTime: 10 * time.Minute,
	}
}

func ConfigureDB(db *sql.DB) {
	cfg := GetDBConfig()
	db.SetMaxOpenConns(cfg.MaxOpenConns)
	db.SetMaxIdleConns(cfg.MaxIdleConns)
	db.SetConnMaxLifetime(cfg.ConnMaxLifetime)
	db.SetConnMaxIdleTime(cfg.ConnMaxIdleTime)
}

func GetDatabaseURL() string {
	url := os.Getenv("DATABASE_URL")
	if url == "" {
		url = "sqlite://./atlanticproxy.db"
	}
	return url
}
