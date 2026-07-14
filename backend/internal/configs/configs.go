package config

import (
	"fmt"
	"log"
	"os"
	"strconv"
)

type Config struct {
	RedisAddr     string
	RedisPassword string
	RedisDB       int

	JWTSecret string

	RazorpayKeyID         string
	RazorpayKeySecret     string
	RazorpayWebhookSecret string

	ResendAPIKey string
	EmailFrom    string
}

func Load() (*Config, error) {
	redisDB, err := strconv.Atoi(os.Getenv("REDIS_DB"))
	if err != nil {
		return nil, fmt.Errorf("invalid REDIS_DB: %w", err)
	}

	log.Println("Connected to Redis")

	cfg := &Config{
		RedisAddr:             os.Getenv("REDIS_ADDR"),
		RedisPassword:         os.Getenv("REDIS_PASSWORD"),
		RedisDB:               redisDB,
		JWTSecret:             os.Getenv("JWT_SECRET"),
		RazorpayKeyID:         os.Getenv("RAZORPAY_KEY_ID"),
		RazorpayKeySecret:     os.Getenv("RAZORPAY_KEY_SECRET"),
		RazorpayWebhookSecret: os.Getenv("RAZORPAY_WEBHOOK_SECRET"),

		ResendAPIKey: os.Getenv("RESEND_API_KEY"),
		EmailFrom:    os.Getenv("EMAIL_FROM"),
	}

	if cfg.RedisAddr == "" {
		return nil, fmt.Errorf("REDIS_ADDR is required")
	}

	if cfg.JWTSecret == "" {
		return nil, fmt.Errorf("JWT_SECRET is required")
	}

	if cfg.RazorpayKeyID == "" {
		return nil, fmt.Errorf("RAZORPAY_KEY_ID is required")
	}

	if cfg.RazorpayKeySecret == "" {
		return nil, fmt.Errorf("RAZORPAY_KEY_SECRET is required")
	}

	return cfg, nil
}
