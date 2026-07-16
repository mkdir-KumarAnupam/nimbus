# ===============================
# Stage 1 - Build the application
# ===============================
FROM golang:1.26 AS builder

WORKDIR /app

# Download dependencies first (better cache)
COPY go.mod go.sum ./
RUN go mod download

# Copy the source code
COPY . .

# Build a static Linux binary
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
    go build -o api ./cmd/api

# ===============================
# Stage 2 - Runtime image
# ===============================
FROM alpine:latest

WORKDIR /app

# Install SSL certificates
RUN apk --no-cache add ca-certificates

# Copy the compiled binary
COPY --from=builder /app/api .

# Copy email templates and other embedded/static assets if needed
COPY --from=builder /app/internal/email/template ./internal/email/template

EXPOSE 8088

CMD ["./api"]
