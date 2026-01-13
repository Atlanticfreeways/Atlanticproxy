# Testing Guide

This guide describes how to run tests and verification procedures for the AtlanticProxy project.

## Unit Testing

The project uses the standard Go testing framework.

### Pre-requisites
- Go 1.21+
- SQLite installed
- GCC (for cgo/sqlite)

### Running Tests
Run all tests in the project:
```bash
cd scripts/proxy-client
go test ./...
```

Run with verbose output:
```bash
go test -v ./...
```

Run with race detector:
```bash
go test -race ./...
```

### Coverage
Generate coverage report:
```bash
go test -coverprofile=coverage.out ./...
go tool cover -html=coverage.out
```

---

## Test Structure

### `internal/storage`
Tests database persistence, schema creation, and CRUD operations.
- `sqlite_test.go`: Verifies SQLite backend and all table operations.

### `internal/billing`
Tests billing logic, quota management, and currency conversion.
- `manager_test.go`: Verifies subscription lifecycle and usage tracking.

### `internal/adblock`
Tests ad-blocking engine and rule parsing.
- `adblock_test.go`: Verifies domain blocking and whitelist logic.

---

## Integration Testing (Manual)

Due to external dependencies (Oxylabs, Paystack), some tests are manual.

### 1. Proxy Connectivity
**Requires:** Oxylabs credentials (Residential Proxies)
**Command:**
```bash
curl -x http://localhost:8080 http://ip-api.com/json
```
**Verify:**
- Returns IP different from ISP
- Region matches settings

### 2. Payment Flow
**Requires:** Paystack Test Keys
**Steps:**
1. Start service
2. Create checkout session (`POST /api/billing/checkout`)
3. Complete payment in browser
4. Verify webhook received and subscription updated

### 3. Kill Switch
**Requires:** Linux/macOS
**Steps:**
1. Enable kill switch: `POST /killswitch {"enabled": true}`
2. Stop service
3. Verify internet is blocked
4. Start service -> Disable kill switch

---

## Continuous Integration

CI pipeline checks:
1. `go vet ./...` (Static analysis)
2. `go test ./...` (Unit tests)
3. `go build ./cmd/service` (Compilation)

Ensure these pass before pushing code.
