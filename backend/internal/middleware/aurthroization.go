package middleware

import (
	"net/http"
	"strings"

	"github.com/mkdir-KumarAnupam/airline-booking/internal/auth"
	"github.com/mkdir-KumarAnupam/airline-booking/internal/response"
)

type AuthorizationMiddleware struct{}

func NewAuthorizationMiddleware() *AuthorizationMiddleware {
	return &AuthorizationMiddleware{}
}

func (a *AuthorizationMiddleware) RequireAdmin() func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			claims, ok := r.Context().Value(UserContextKey).(*auth.Claims)
			if !ok || claims == nil {
				response.Error(w, http.StatusUnauthorized, "unauthorized")
				return
			}

			if !strings.EqualFold(claims.Role, "admin") {
				response.Error(w, http.StatusForbidden, "forbidden: admin access required")
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}
