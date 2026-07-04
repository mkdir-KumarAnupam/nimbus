package main

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/mkdir-KumarAnupam/airline-booking/internal/domain"
	"github.com/mkdir-KumarAnupam/airline-booking/internal/handlers"
	pgrepo "github.com/mkdir-KumarAnupam/airline-booking/internal/repository/postgres"
	"github.com/mkdir-KumarAnupam/airline-booking/internal/service"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

type airportMessageResponse struct {
	Message string `json:"message"`
}

type airportResponse struct {
	ID       string `json:"id"`
	Code     string `json:"code"`
	Name     string `json:"name"`
	City     string `json:"city"`
	Country  string `json:"country"`
	Timezone string `json:"timezone"`
}

func newAirportTestMux(t *testing.T) *http.ServeMux {
	t.Helper()

	db, err := gorm.Open(sqlite.Open("file::memory:?cache=shared"), &gorm.Config{})
	if err != nil {
		t.Fatalf("open sqlite db: %v", err)
	}

	if err := db.AutoMigrate(&domain.Airport{}); err != nil {
		t.Fatalf("migrate airport table: %v", err)
	}

	airportRepo := pgrepo.NewAirportRepository(db)
	airportService := service.NewAirportService(airportRepo)
	airportHandler := handlers.NewAirportHandler(airportService)

	mux := http.NewServeMux()
	registerAirportRoutes(mux, airportHandler)
	return mux
}

func doJSONRequest(t *testing.T, mux *http.ServeMux, method, path string, body []byte) *httptest.ResponseRecorder {
	t.Helper()

	req := httptest.NewRequest(method, path, bytes.NewReader(body))
	rec := httptest.NewRecorder()

	mux.ServeHTTP(rec, req)
	return rec
}

func decodeAirportResponse(t *testing.T, rec *httptest.ResponseRecorder) airportResponse {
	t.Helper()

	var resp airportResponse
	if err := json.NewDecoder(rec.Body).Decode(&resp); err != nil {
		t.Fatalf("decode airport response: %v", err)
	}

	return resp
}

func decodeMessageResponse(t *testing.T, rec *httptest.ResponseRecorder) airportMessageResponse {
	t.Helper()

	var resp airportMessageResponse
	if err := json.NewDecoder(rec.Body).Decode(&resp); err != nil {
		t.Fatalf("decode message response: %v", err)
	}

	return resp
}

func TestAirportCRUDFlow(t *testing.T) {
	mux := newAirportTestMux(t)

	createBody := []byte(`{"code":"jfk","name":"John F. Kennedy International","city":"New York","country":"USA","timezone":"America/New_York"}`)
	createRec := doJSONRequest(t, mux, http.MethodPost, "/api/v1/airports", createBody)
	if createRec.Code != http.StatusCreated {
		t.Fatalf("expected create status %d, got %d", http.StatusCreated, createRec.Code)
	}

	createResp := decodeMessageResponse(t, createRec)
	if createResp.Message != "airport created" {
		t.Fatalf("expected create message, got %q", createResp.Message)
	}

	getByCodeRec := doJSONRequest(t, mux, http.MethodGet, "/api/v1/airports/code/JFK", nil)
	if getByCodeRec.Code != http.StatusOK {
		t.Fatalf("expected get-by-code status %d, got %d", http.StatusOK, getByCodeRec.Code)
	}

	airport := decodeAirportResponse(t, getByCodeRec)
	if airport.Code != "JFK" || airport.Timezone != "America/New_York" {
		t.Fatalf("unexpected airport from get-by-code: %+v", airport)
	}

	getByIDRec := doJSONRequest(t, mux, http.MethodGet, "/api/v1/airports/"+airport.ID, nil)
	if getByIDRec.Code != http.StatusOK {
		t.Fatalf("expected get-by-id status %d, got %d", http.StatusOK, getByIDRec.Code)
	}

	airportByID := decodeAirportResponse(t, getByIDRec)
	if airportByID.ID != airport.ID || airportByID.Code != "JFK" {
		t.Fatalf("unexpected airport from get-by-id: %+v", airportByID)
	}

	updateBody := []byte(`{"name":"Kennedy Airport","city":"Queens","country":"United States","timezone":"America/Toronto"}`)
	updateRec := doJSONRequest(t, mux, http.MethodPut, "/api/v1/airports/"+airport.ID, updateBody)
	if updateRec.Code != http.StatusOK {
		t.Fatalf("expected update status %d, got %d", http.StatusOK, updateRec.Code)
	}

	updateResp := decodeMessageResponse(t, updateRec)
	if updateResp.Message != "airport updated" {
		t.Fatalf("expected update message, got %q", updateResp.Message)
	}

	updatedRec := doJSONRequest(t, mux, http.MethodGet, "/api/v1/airports/"+airport.ID, nil)
	if updatedRec.Code != http.StatusOK {
		t.Fatalf("expected updated get status %d, got %d", http.StatusOK, updatedRec.Code)
	}

	updatedAirport := decodeAirportResponse(t, updatedRec)
	if updatedAirport.Name != "Kennedy Airport" || updatedAirport.City != "Queens" || updatedAirport.Timezone != "America/Toronto" {
		t.Fatalf("unexpected updated airport: %+v", updatedAirport)
	}

	deleteRec := doJSONRequest(t, mux, http.MethodDelete, "/api/v1/airports/"+airport.ID, nil)
	if deleteRec.Code != http.StatusOK {
		t.Fatalf("expected delete status %d, got %d", http.StatusOK, deleteRec.Code)
	}

	deleteResp := decodeMessageResponse(t, deleteRec)
	if deleteResp.Message != "airport deleted" {
		t.Fatalf("expected delete message, got %q", deleteResp.Message)
	}

	missingRec := doJSONRequest(t, mux, http.MethodGet, "/api/v1/airports/"+airport.ID, nil)
	if missingRec.Code != http.StatusNotFound {
		t.Fatalf("expected missing airport status %d, got %d", http.StatusNotFound, missingRec.Code)
	}
}
