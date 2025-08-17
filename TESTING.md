# Testing Guide - AI Resume Builder

This document provides comprehensive information about testing the AI Resume Builder application.

## 🧪 Testing Strategy

Our testing strategy includes multiple levels of testing to ensure code quality, reliability, and user experience:

1. **Unit Tests** - Test individual functions and components in isolation
2. **Integration Tests** - Test API endpoints and component interactions
3. **End-to-End Tests** - Test complete user workflows in a browser environment

## 📋 Test Structure

```
├── src/
│   ├── components/__tests__/    # Component unit tests
│   ├── lib/__tests__/           # Utility function unit tests
│   └── pages/__tests__/         # Page component tests
├── tests/
│   ├── unit/                    # Additional unit tests
│   ├── integration/             # API integration tests
│   └── e2e/                     # End-to-end tests
├── jest.config.js               # Jest configuration
├── jest.setup.js                # Jest setup and mocks
└── playwright.config.ts         # Playwright E2E configuration
```

## 🚀 Running Tests

### Prerequisites

```bash
# Install dependencies
npm install

# For E2E tests, install Playwright browsers
npx playwright install
```

### Available Test Commands

```bash
# Run all unit and integration tests
npm test

# Run tests in watch mode (great for development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run end-to-end tests
npm run test:e2e

# Run E2E tests with UI (interactive mode)
npm run test:e2e:ui

# Type checking
npm run type-check

# Linting
npm run lint
```

## 🔧 Unit Tests

Unit tests are located alongside the code they test using the `__tests__` folder convention.

### Component Testing

```typescript
// Example: src/components/__tests__/Layout.test.tsx
import { render, screen } from '@testing-library/react'
import Layout from '../Layout'

test('renders navigation correctly', () => {
  render(
    <Layout>
      <div>Test Content</div>
    </Layout>
  )
  
  expect(screen.getByText('AI Resume Builder')).toBeInTheDocument()
})
```

### Utility Function Testing

```typescript
// Example: src/lib/__tests__/auth.test.ts
import { generateOTP } from '../auth'

test('generates 6-digit OTP', () => {
  const otp = generateOTP()
  expect(otp).toMatch(/^\d{6}$/)
})
```

### Running Specific Tests

```bash
# Run tests for a specific file
npm test -- Layout.test.tsx

# Run tests matching a pattern
npm test -- --testNamePattern="authentication"

# Run tests for changed files only
npm test -- --onlyChanged
```

## 🔗 Integration Tests

Integration tests verify that different parts of the application work together correctly, particularly API endpoints.

### API Endpoint Testing

```typescript
// Example: tests/integration/api.test.ts
import { createMocks } from 'node-mocks-http'
import handler from '@/pages/api/auth/send-otp'

test('sends OTP successfully', async () => {
  const { req, res } = createMocks({
    method: 'POST',
    body: { email: 'test@example.com' }
  })

  await handler(req, res)

  expect(res._getStatusCode()).toBe(200)
})
```

### Database Integration Tests

Integration tests use mocked Azure services to avoid external dependencies during testing.

## 🌐 End-to-End Tests

E2E tests use Playwright to test complete user workflows in real browsers.

### Test Structure

```typescript
// Example: tests/e2e/auth-flow.spec.ts
import { test, expect } from '@playwright/test'

test('user can complete authentication flow', async ({ page }) => {
  await page.goto('/auth/login')
  
  await page.fill('[data-testid=email-input]', 'test@example.com')
  await page.click('[data-testid=send-otp-button]')
  
  await expect(page).toHaveURL('/dashboard')
})
```

### Running E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run specific test file
npm run test:e2e -- auth-flow.spec.ts

# Run tests in headed mode (see browser)
npm run test:e2e -- --headed

# Run tests in debug mode
npm run test:e2e -- --debug

# Run tests on specific browser
npm run test:e2e -- --project=chromium
```

### E2E Test Configuration

Tests run against multiple browsers and viewports:
- Desktop: Chrome, Firefox, Safari
- Mobile: Chrome Mobile, Safari Mobile

## 🎭 Mocking Strategy

### Azure Services Mocking

All Azure services are mocked in tests to avoid external dependencies:

```typescript
// jest.setup.js
jest.mock('@azure/storage-blob', () => ({
  BlobServiceClient: {
    fromConnectionString: jest.fn(() => ({
      // Mock implementation
    }))
  }
}))
```

### API Route Mocking (E2E)

```typescript
// In E2E tests
await page.route('/api/auth/send-otp', async (route) => {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ success: true })
  })
})
```

## 📊 Coverage Reports

### Generating Coverage Reports

```bash
npm run test:coverage
```

Coverage reports are generated in the `coverage/` directory:
- `coverage/lcov-report/index.html` - HTML coverage report
- `coverage/lcov.info` - LCOV format for CI tools

### Coverage Thresholds

Current coverage targets:
- Statements: 80%
- Branches: 75%
- Functions: 80%
- Lines: 80%

## 🔍 Test Data and Fixtures

### Test User Data

```typescript
const mockUser = {
  id: 'test-user-123',
  email: 'test@example.com',
  subscription_type: 'free',
  created_at: '2024-01-01T00:00:00Z',
  last_login: '2024-01-01T00:00:00Z'
}
```

### Mock Resume Data

```typescript
const mockResumeData = {
  personal_info: {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '(555) 123-4567'
  },
  experience: [
    {
      id: 'exp-1',
      company: 'Tech Corp',
      position: 'Software Engineer',
      startDate: '2020-01-01',
      endDate: '2023-12-31',
      description: 'Developed web applications',
      achievements: ['Improved performance by 50%']
    }
  ],
  skills: [
    { name: 'JavaScript', level: 'advanced', category: 'Programming' }
  ],
  education: [
    {
      id: 'edu-1',
      institution: 'University',
      degree: 'Computer Science',
      field: 'Software Engineering',
      startDate: '2016',
      endDate: '2020'
    }
  ]
}
```

## 🐛 Debugging Tests

### Jest Debugging

```bash
# Debug specific test
npm test -- --detectOpenHandles --forceExit Layout.test.tsx

# Run with verbose output
npm test -- --verbose

# Run with no cache
npm test -- --no-cache
```

### Playwright Debugging

```bash
# Debug mode with browser developer tools
npm run test:e2e -- --debug

# Generate trace for failed tests
npm run test:e2e -- --trace on

# View test results
npx playwright show-report
```

### VS Code Integration

Add to `.vscode/launch.json`:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Jest Tests",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand", "--no-cache", "--no-coverage"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

## 🚨 Common Testing Patterns

### Testing Async Functions

```typescript
test('handles async operations', async () => {
  const result = await someAsyncFunction()
  expect(result).toBeDefined()
})
```

### Testing Error Handling

```typescript
test('handles errors gracefully', async () => {
  mockFunction.mockRejectedValue(new Error('Test error'))
  
  await expect(functionUnderTest()).rejects.toThrow('Test error')
})
```

### Testing React Components with State

```typescript
test('updates state correctly', async () => {
  render(<Component />)
  
  const button = screen.getByRole('button')
  fireEvent.click(button)
  
  await waitFor(() => {
    expect(screen.getByText('Updated')).toBeInTheDocument()
  })
})
```

## 📈 Continuous Integration

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - run: npm ci
      - run: npm run test:coverage
      - run: npm run test:e2e
```

### Test Reports

- Unit test results are displayed in the console
- Coverage reports are generated in HTML format
- E2E test results include screenshots and videos for failures

## 🔧 Troubleshooting

### Common Issues

**Jest tests failing with module resolution errors:**
```bash
# Clear Jest cache
npm test -- --clearCache
```

**Playwright tests timing out:**
```bash
# Increase timeout in playwright.config.ts
timeout: 60000
```

**Mock not working:**
- Ensure mocks are defined before imports
- Check mock file paths are correct
- Verify mock implementation matches expected interface

### Performance Tips

1. Use `test.concurrent()` for independent tests
2. Mock heavy dependencies
3. Use `beforeAll` for expensive setup
4. Avoid testing implementation details

## 📚 Best Practices

### Unit Tests
- Test behavior, not implementation
- Use descriptive test names
- Keep tests focused and isolated
- Mock external dependencies

### Integration Tests
- Test realistic scenarios
- Verify error handling
- Test edge cases
- Use proper cleanup

### E2E Tests
- Focus on critical user journeys
- Use data attributes for selectors
- Keep tests independent
- Handle async operations properly

## 🎯 Testing Checklist

Before submitting code, ensure:

- [ ] All tests pass locally
- [ ] New features have corresponding tests
- [ ] Coverage meets minimum thresholds
- [ ] E2E tests cover critical paths
- [ ] Error scenarios are tested
- [ ] Tests are properly documented

---

For more specific testing questions or issues, please check the project's issue tracker or contact the development team.