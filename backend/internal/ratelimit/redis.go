package ratelimit

import (
	"context"
	"time"

	"github.com/redis/go-redis/v9"
)

type RedisLimiter struct {
	client *redis.Client
}

func NewRedisLimiter(client *redis.Client) *RedisLimiter {
	return &RedisLimiter{
		client: client,
	}
}

func (r *RedisLimiter) Allow(
	ctx context.Context,
	key string,
	limit int,
	window time.Duration,
) (bool, error) {

	// Increment the counter.
	count, err := r.client.Incr(ctx, key).Result()
	if err != nil {
		return false, err
	}

	// First request starts the expiration window.
	if count == 1 {
		if err := r.client.Expire(ctx, key, window).Err(); err != nil {
			return false, err
		}
	}

	// Reject if the limit has been exceeded.
	if count > int64(limit) {
		return false, nil
	}

	return true, nil
}
