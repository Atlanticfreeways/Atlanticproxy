# Build stage
FROM golang:1.21-alpine AS builder

# Install build dependencies
RUN apk add --no-cache gcc musl-dev

WORKDIR /app

# Copy dependency files
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build binary
# CGO_ENABLED=1 is required for go-sqlite3/modernc.org/sqlite
RUN CGO_ENABLED=0 go build -ldflags="-w -s" -o atlantic-service ./cmd/service

# Runtime stage
FROM alpine:3.19

# Install runtime dependencies (ca-certificates for HTTPS)
RUN apk add --no-cache ca-certificates tzdata

# Create non-root user
RUN adduser -D -g '' atlantic

WORKDIR /app

# Copy binary from builder
COPY --from=builder /app/atlantic-service .

# Create directory for database
RUN mkdir -p /data && chown -R atlantic:atlantic /data

# Use non-root user
USER atlantic

# Expose ports
# 8082: API Server
# 8080: HTTP Proxy
# 1080: SOCKS5 Proxy
EXPOSE 8082 8080 1080

# Environment variables with defaults
ENV SERVER_PORT=8082 \
    DATABASE_PATH=/data/atlantic.db \
    LOG_LEVEL=info \
    LOG_FORMAT=json

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8082/health || exit 1

# Run service
CMD ["./atlantic-service"]
