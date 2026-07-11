package middleware

import (
	"context"
	"net/http"

	"github.com/mkdir-KumarAnupam/airline-booking/backend/internal/auth"
	"github.com/mkdir-KumarAnupam/airline-booking/backend/internal/response"
)

type AuthMiddleware struct {
	jwtService *auth.JWTService
}

func NewAuthMiddleware(jwtService *auth.JWTService) *AuthMiddleware {
	return &AuthMiddleware{jwtService: jwtService}
}

func (amw *AuthMiddleware) Authenticate(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		cookie, err := r.Cookie("access_token")
		if err != nil {
			response.Error(w, http.StatusUnauthorized, "authentication required")
			return
		}

		claims, err := amw.jwtService.Validate(cookie.Value)
		if err != nil {
			response.Error(w, http.StatusUnauthorized, "invalid token")
			return
		}

		ctx := context.WithValue(r.Context(), UserContextKey, claims)

		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
