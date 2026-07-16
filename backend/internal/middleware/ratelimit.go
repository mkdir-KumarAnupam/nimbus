package middleware

import (
	"fmt"
	"net"
	"net/http"
	"strings"
	"time"

	"github.com/mkdir-KumarAnupam/airline-booking/internal/auth"
	"github.com/mkdir-KumarAnupam/airline-booking/internal/ratelimit"
)

type RateLimitMiddleware struct {
	limiter ratelimit.Limiter
}

func NewRateLimitMiddleware(
	limiter ratelimit.Limiter,
) *RateLimitMiddleware {
	return &RateLimitMiddleware{
		limiter: limiter,
	}
}

func (m *RateLimitMiddleware) Limit(
	resource string,
	limit int,
	window time.Duration,
) func(http.Handler) http.Handler {

	return func(next http.Handler) http.Handler { //Return an http handler in the end

		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

			identifier := clientIdentifier(r)

			key := fmt.Sprintf(
				"ratelimit:%s:%s",
				resource,
				identifier,
			)

			allowed, err := m.limiter.Allow(
				r.Context(),
				key,
				limit,
				window,
			)

			if err != nil {
				http.Error(
					w,
					"Internal Server Error",
					http.StatusInternalServerError,
				)
				return
			}

			if !allowed {
				w.Header().Set("Retry-After", fmt.Sprintf("%.0f", window.Seconds()))

				http.Error(
					w,
					"Too Many Requests",
					http.StatusTooManyRequests,
				)

				return
			}

			next.ServeHTTP(w, r)
		})
	}
}

func clientIP(r *http.Request) string {

	if forwarded := r.Header.Get("X-Forwarded-For"); forwarded != "" {

		parts := strings.Split(forwarded, ",")

		return strings.TrimSpace(parts[0])
	}

	if realIP := r.Header.Get("X-Real-IP"); realIP != "" {
		return realIP
	}

	ip, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return r.RemoteAddr
	}

	return ip
}

func clientIdentifier(r *http.Request) string {

	if claims, ok := r.Context().Value(UserContextKey).(auth.Claims); ok {
		return "user:" + claims.Email
	}

	return "ip:" + clientIP(r)
}
