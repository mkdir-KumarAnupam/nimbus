package auth

import "github.com/golang-jwt/jwt/v5"

type Claims struct {
	Email    string `json:"email"`
	Username string `json:"username"`
	Role     string `json:"role"`
	jwt.RegisteredClaims
}
