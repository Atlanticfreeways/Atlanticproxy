# Atlantic Proxy Frontend - Testing Guide

## Test Structure

```
src/
├── __tests__/
│   ├── components.test.tsx
│   ├── api.test.ts
│   └── hooks.test.ts
└── components/
```

## Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test components.test.tsx

# Run with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

## Test Coverage Goals

- Statements: 70%
- Branches: 70%
- Functions: 70%
- Lines: 70%

## Component Testing

Test components for:
- Rendering
- User interactions
- Props handling
- Error states
- Loading states

Example:
```typescript
it('renders component', () => {
  render(<Component />);
  expect(screen.getByText(/text/i)).toBeInTheDocument();
});
```

## API Testing

Test API client for:
- Request formatting
- Authentication headers
- Error handling
- Response parsing

## Integration Testing

Test component + API integration:
- Data fetching
- State updates
- Error handling

## E2E Testing

```bash
npm run test:e2e
```

Test user workflows:
- Login flow
- Proxy creation
- Billing operations
- Settings changes

## Mocking

- Mock API responses
- Mock localStorage
- Mock fetch calls

## CI/CD Integration

Tests run automatically on:
- Pull requests
- Commits to main
- Pre-deployment

## Performance Testing

```bash
npm run test:performance
```

Monitor:
- Component render time
- API response time
- Bundle size
