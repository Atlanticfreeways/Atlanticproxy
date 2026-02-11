# Testing Strategy

**Last Updated:** February 14, 2026  
**Status:** Active  
**Coverage Target:** 80%+

---

## 🎯 Testing Philosophy

**Test what matters. Automate everything. Ship with confidence.**

AtlanticProxy follows a comprehensive testing strategy covering unit, integration, and E2E tests to ensure production reliability.

---

## 📊 Coverage Requirements

### Minimum Coverage Targets
- **Overall:** 80%+ code coverage
- **Critical Paths:** 100% (payment, auth, billing)
- **API Endpoints:** 90%+
- **Business Logic:** 85%+
- **UI Components:** 70%+

### Current Coverage
- **Backend:** ~20-30% (17 test files)
- **Frontend:** ~10% (minimal tests)
- **Target:** 80%+ by end of Week 2

---

## 🧪 Test Types

### 1. Unit Tests (60% of tests)
**Purpose:** Test individual functions/methods in isolation

**Coverage:**
- Payment processing (Paystack integration)
- Authentication (JWT, password hashing)
- Billing logic (subscriptions, quotas)
- Rotation algorithms
- Rate limiting
- Data validation

**Tools:**
- Backend: Go `testing` package
- Frontend: Jest + React Testing Library

**Example:**
```go
func TestCreateCheckout_Success(t *testing.T) {
    client := NewMockPaystackClient()
    result, err := client.CreateCheckout(CheckoutRequest{...})
    assert.NoError(t, err)
    assert.NotEmpty(t, result.URL)
}
```

### 2. Integration Tests (30% of tests)
**Purpose:** Test component interactions

**Coverage:**
- API endpoint flows
- Database operations
- External API integrations
- WebSocket connections
- Rate limiting enforcement

**Tools:**
- Backend: Go `testing` + `httptest`
- Database: Test PostgreSQL instance
- Mocking: `testify/mock`

**Example:**
```go
func TestRegistrationFlow(t *testing.T) {
    // POST /api/auth/register
    // Verify user created in DB
    // Verify JWT returned
}
```

### 3. E2E Tests (10% of tests)
**Purpose:** Test complete user journeys

**Coverage:**
- User registration → login → dashboard
- Trial signup → payment → activation
- Proxy connection → rotation → disconnect
- Settings changes → persistence

**Tools:**
- Playwright (TypeScript)
- Test environment: Staging

**Example:**
```typescript
test('user can complete trial signup', async ({ page }) => {
  await page.goto('/signup');
  await page.fill('[name="email"]', 'test@example.com');
  // ... complete flow
  await expect(page).toHaveURL('/dashboard');
});
```

---

## 📋 Week 2 Testing Plan

### Day 1: Payment & Auth Tests
**Morning: Payment (8 tests)**
- ✅ CreateCheckout - success
- ✅ CreateCheckout - API error
- ✅ VerifyTransaction - success
- ✅ VerifyTransaction - invalid ref
- ✅ Webhook signature verification
- ✅ Mock Paystack responses
- Target: 100% payment coverage

**Afternoon: Auth (7 tests)**
- ✅ User registration - success
- ✅ User registration - duplicate email
- ✅ User login - success
- ✅ User login - wrong password
- ✅ JWT generation
- ✅ JWT validation
- Target: 100% auth coverage

### Day 2: Billing & Quota Tests
**Morning: Billing (7 tests)**
- ✅ Subscription creation
- ✅ Subscription cancellation
- ✅ Plan upgrades/downgrades
- ✅ Usage tracking
- ✅ Quota calculations
- Target: 100% billing coverage

**Afternoon: Enforcement (6 tests)**
- ✅ Data limit enforcement
- ✅ Request limit enforcement
- ✅ Concurrent connection limits
- ✅ Plan feature restrictions
- ✅ Upgrade prompts
- Target: 100% enforcement coverage

### Day 3: Integration Tests
**Morning: Database (8 tests)**
- ✅ User CRUD operations
- ✅ Subscription CRUD
- ✅ Transaction logging
- ✅ Usage tracking persistence
- ✅ Database migrations
- ✅ Test data cleanup

**Afternoon: API (8 tests)**
- ✅ Registration flow
- ✅ Login flow
- ✅ Trial signup flow
- ✅ Payment verification
- ✅ Webhook handling
- ✅ Protected endpoints
- ✅ Rate limiting

### Day 4: E2E Setup & Tests
**Morning: Setup (7 tasks)**
- ✅ Install Playwright
- ✅ Configure playwright.config.ts
- ✅ Create fixtures
- ✅ Create helpers
- ✅ Database seeding
- ✅ Paystack test mode

**Afternoon: E2E Tests (7 tests)**
- ✅ User registration
- ✅ User login/logout
- ✅ Trial signup
- ✅ Payment flow
- ✅ Dashboard redirect

### Day 5: Dashboard E2E & Coverage
**Morning: Dashboard (7 tests)**
- ✅ All 13 pages load
- ✅ Navigation works
- ✅ Proxy connection
- ✅ IP rotation
- ✅ Settings changes
- ✅ WebSocket updates

**Afternoon: Coverage (5 tasks)**
- ✅ Run all tests
- ✅ Generate coverage report
- ✅ Fix failing tests
- ✅ Verify 80%+ coverage
- ✅ Document results

---

## 🛠️ Testing Tools

### Backend
```bash
# Run all tests
go test ./...

# Run with coverage
go test -cover ./...

# Generate coverage report
go test -coverprofile=coverage.out ./...
go tool cover -html=coverage.out

# Run specific package
go test ./internal/payment/...

# Run with race detection
go test -race ./...
```

### Frontend
```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test
npm test -- auth.test.tsx

# Watch mode
npm test -- --watch
```

### E2E
```bash
# Run all E2E tests
npx playwright test

# Run specific test
npx playwright test auth.spec.ts

# Run in headed mode
npx playwright test --headed

# Generate report
npx playwright show-report
```

---

## 📝 Test Writing Guidelines

### 1. Test Naming
```go
// Pattern: Test<Function>_<Scenario>
func TestCreateCheckout_Success(t *testing.T) {}
func TestCreateCheckout_InvalidEmail(t *testing.T) {}
func TestCreateCheckout_APIError(t *testing.T) {}
```

### 2. Test Structure (AAA Pattern)
```go
func TestExample(t *testing.T) {
    // Arrange - Set up test data
    user := &User{Email: "test@example.com"}
    
    // Act - Execute the function
    result, err := CreateUser(user)
    
    // Assert - Verify the result
    assert.NoError(t, err)
    assert.NotNil(t, result)
}
```

### 3. Use Table-Driven Tests
```go
func TestValidateEmail(t *testing.T) {
    tests := []struct {
        name    string
        email   string
        wantErr bool
    }{
        {"valid", "test@example.com", false},
        {"invalid", "invalid", true},
        {"empty", "", true},
    }
    
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            err := ValidateEmail(tt.email)
            if (err != nil) != tt.wantErr {
                t.Errorf("got %v, want error: %v", err, tt.wantErr)
            }
        })
    }
}
```

### 4. Mock External Dependencies
```go
type MockPaystackClient struct {
    mock.Mock
}

func (m *MockPaystackClient) CreateCheckout(req CheckoutRequest) (*CheckoutResponse, error) {
    args := m.Called(req)
    return args.Get(0).(*CheckoutResponse), args.Error(1)
}
```

### 5. Clean Up After Tests
```go
func TestDatabaseOperation(t *testing.T) {
    db := setupTestDB(t)
    defer cleanupTestDB(t, db)
    
    // Test code here
}
```

---

## 🎯 Critical Test Scenarios

### Payment Tests (Priority: CRITICAL)
1. ✅ Successful checkout creation
2. ✅ Failed checkout (API error)
3. ✅ Transaction verification (success)
4. ✅ Transaction verification (invalid)
5. ✅ Webhook signature validation
6. ✅ Webhook processing
7. ✅ Duplicate transaction handling
8. ✅ Refund processing

### Auth Tests (Priority: CRITICAL)
1. ✅ User registration (success)
2. ✅ User registration (duplicate email)
3. ✅ User login (success)
4. ✅ User login (wrong password)
5. ✅ JWT token generation
6. ✅ JWT token validation
7. ✅ JWT token expiration
8. ✅ Password hashing

### Billing Tests (Priority: HIGH)
1. ✅ Subscription creation
2. ✅ Subscription cancellation
3. ✅ Plan upgrade
4. ✅ Plan downgrade
5. ✅ Usage tracking
6. ✅ Quota enforcement
7. ✅ Billing cycle calculation
8. ✅ Invoice generation

---

## 🚀 CI/CD Integration

### GitHub Actions Workflow
```yaml
- name: Run Backend Tests
  run: |
    cd scripts/proxy-client
    go test -v -race -coverprofile=coverage.out ./...
    
- name: Upload Coverage
  uses: codecov/codecov-action@v4
  with:
    files: ./scripts/proxy-client/coverage.out
    
- name: Run Frontend Tests
  run: |
    cd atlantic-dashboard
    npm test -- --coverage
```

### Coverage Requirements
- **PR Merge:** 80%+ coverage required
- **Critical Paths:** 100% coverage required
- **New Code:** Must include tests

---

## 📊 Success Criteria

### Week 2 Goals
- ✅ 80%+ overall coverage
- ✅ 100% payment coverage
- ✅ 100% auth coverage
- ✅ 100% billing coverage
- ✅ All E2E tests passing
- ✅ CI/CD tests passing

### Quality Metrics
- ✅ Zero flaky tests
- ✅ Test execution < 5 minutes
- ✅ All tests documented
- ✅ Coverage report generated

---

## 🔧 Troubleshooting

### Common Issues

**Tests failing in CI but passing locally:**
- Check environment variables
- Verify database state
- Check for race conditions

**Slow test execution:**
- Use parallel testing: `go test -parallel 4`
- Mock external APIs
- Use in-memory database for unit tests

**Flaky tests:**
- Add proper waits in E2E tests
- Avoid time-dependent assertions
- Use deterministic test data

---

## 📚 Resources

- [Go Testing Package](https://pkg.go.dev/testing)
- [Testify Documentation](https://github.com/stretchr/testify)
- [Playwright Documentation](https://playwright.dev)
- [Jest Documentation](https://jestjs.io)

---

**Next Steps:**
1. Start Week 2 Day 1 (Payment & Auth tests)
2. Achieve 80%+ coverage by Friday
3. Document all test scenarios
4. Update CI/CD with coverage requirements
