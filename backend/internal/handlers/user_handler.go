	package handlers
	
	import (
		"encoding/json"
		"log"
		"net/http"
		"os"
	
		"github.com/mkdir-KumarAnupam/airline-booking/internal/auth"
		dto2 "github.com/mkdir-KumarAnupam/airline-booking/internal/dto"
		"github.com/mkdir-KumarAnupam/airline-booking/internal/middleware"
		"github.com/mkdir-KumarAnupam/airline-booking/internal/response"
		"github.com/mkdir-KumarAnupam/airline-booking/internal/service"
	)
	
	type UserHandler struct {
		userService *service.UserService
	}
	
	func NewUserHandler(userService *service.UserService) *UserHandler {
		return &UserHandler{userService: userService}
	}
	
	func (h *UserHandler) Me(w http.ResponseWriter, r *http.Request) {
		value := r.Context().Value(middleware.UserContextKey)
	
		claims, ok := value.(*auth.Claims)
		if !ok {
			response.Error(w, http.StatusUnauthorized, "unauthorized")
			return
		}
	
		user, err := h.userService.Me(r.Context(), claims.Subject)
		if err != nil {
			response.Error(w, http.StatusNotFound, "user not found")
			return
		}
	
		response.JSON(w, http.StatusOK, dto2.UserResponse{
			ID:        user.ID,
			Email:     user.Email,
			Username:  user.Username,
			CreatedAt: user.CreatedAt,
			UpdatedAt: user.UpdatedAt,
		})
	}
	
	func (h *UserHandler) Register(w http.ResponseWriter, r *http.Request) {
		req := &dto2.RegisterRequest{}
	
		if err := json.NewDecoder(r.Body).Decode(req); err != nil {
			response.Error(w, http.StatusBadRequest, "invalid request body")
			return
		}
	
		if err := h.userService.Register(r.Context(), req); err != nil {
			log.Println("register error:", err)
			response.Error(w, http.StatusConflict, err.Error())
			return
		}
	
		response.JSON(w, http.StatusCreated, map[string]string{
			"message": "user registered successfully",
		})
	}
	
	func (h *UserHandler) Login(w http.ResponseWriter, r *http.Request) {
		req := &dto2.LoginRequest{}
	
		if err := json.NewDecoder(r.Body).Decode(req); err != nil {
			response.Error(w, http.StatusBadRequest, "invalid request body")
			return
		}
	
		token, err := h.userService.Login(r.Context(), req)
		if err != nil {
			log.Println("login error:", err)
			response.Error(w, http.StatusUnauthorized, err.Error())
			return
		}
	
		isProduction := os.Getenv("ENV") == "production"
	
		http.SetCookie(w, &http.Cookie{
			Name:     "access_token",
			Value:    token,
			Path:     "/",
			HttpOnly: true,
			Secure:   isProduction,
			SameSite: func() http.SameSite {
				if isProduction {
					return http.SameSiteNoneMode
				}
				return http.SameSiteLaxMode
			}(),
		})
	
		response.JSON(w, http.StatusOK, map[string]string{
			"message": "login successful",
		})
	}
