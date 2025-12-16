# Session Tracking Test Suite

## 🧪 **Test Coverage Overview**

This comprehensive test suite validates both UX functionality and data integrity for the session tracking system.

### **Test Categories**

| Category | Purpose | Frequency | Tools |
|----------|---------|-----------|-------|
| **Unit Tests** | Individual function validation | Every commit | Vitest |
| **Component Tests** | React component behavior | Every commit | React Testing Library |
| **E2E Tests** | Full user flow validation | Every PR | Playwright |
| **Database Tests** | Data integrity & constraints | Every commit | Vitest + Supabase |
| **Edge Function Tests** | API behavior validation | Every commit | Fetch API |
| **Performance Tests** | Latency & throughput | Daily | Custom benchmarks |
| **Visual Regression** | UI consistency | Every PR | Playwright |
| **Data Quality** | Production monitoring | Daily | Custom SQL checks |

## 🚀 **Quick Start**

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run specific test category
npm run test:components
npm run test:e2e
npm run test:database

# Watch mode for development
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 📋 **Test Execution Guide**

### **1. Pre-commit Tests (Fast)**
```bash
npm run test:unit && npm run test:components
```
*~30 seconds - validates core logic*

### **2. Pre-merge Tests (Comprehensive)**
```bash
npm run test:e2e
npm run test:visual
npm run test:database
```
*~5 minutes - full integration validation*

### **3. Production Monitoring (Daily)**
```bash
npm run test:data-quality
npm run test:performance
```
*~2 minutes - health checks*

## 🎯 **Key Test Scenarios**

### **UX Testing**
- ✅ Session statistics display correctly
- ✅ Active sessions show with proper badges
- ✅ Session history renders with status indicators
- ✅ Device icons match device types
- ✅ Session termination works for both current/other sessions
- ✅ Loading/error states display appropriately
- ✅ Mobile/tablet responsive layouts
- ✅ Empty states show helpful messages

### **Data Testing**
- ✅ Session events insert with proper constraints
- ✅ Event types are validated (started/ended/expired/refreshed)
- ✅ Immutable table prevents updates
- ✅ Analytics view calculates durations correctly
- ✅ RPC functions enforce security policies
- ✅ Concurrent events handle properly
- ✅ Large metadata objects process correctly

### **Edge Function Testing**
- ✅ Event logging succeeds with valid data
- ✅ Authorization is required and validated
- ✅ Invalid event types are rejected
- ✅ CORS headers work correctly
- ✅ High concurrency is handled
- ✅ Client information is extracted properly
- ✅ Error responses are formatted correctly

### **Performance Testing**
- ✅ Event tracking < 500ms latency
- ✅ Burst requests average < 100ms
- ✅ Large metadata < 1s processing
- ✅ Database queries are optimized
- ✅ UI renders without blocking

### **Data Quality Monitoring**
- ✅ No orphaned session events
- ✅ No duplicate session starts
- ✅ Reasonable session durations
- ✅ Valid metadata structures
- ✅ No future timestamps
- ✅ Referential integrity maintained
- ✅ Analytics sync with raw events

## 🔧 **Test Configuration**

### **Environment Variables**
```bash
# Required for all tests
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key

# Required for database/edge function tests
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Required for E2E tests
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=test_password
```

### **Test Data Setup**
- Use isolated test database for integration tests
- Mock API responses for unit/component tests
- Clean up test data automatically after each test
- Use deterministic test data for visual regression

## 📊 **Continuous Monitoring**

### **GitHub Actions Integration**
- **Push to main**: Full test suite + performance tests
- **Pull requests**: Core tests + visual regression
- **Daily cron**: Data quality monitoring
- **Failed tests**: Slack notifications

### **Test Metrics Tracked**
- Test execution time trends
- Coverage percentage
- Performance regression detection
- Data quality score
- Visual diff count

### **Alerting**
- Data quality failures → Slack
- Performance regression → Email
- Critical E2E failures → PagerDuty
- Test suite failures → GitHub status checks

## 🐛 **Debugging Test Failures**

### **Component Test Failures**
1. Check mock data matches expected format
2. Verify component props are passed correctly
3. Look for async timing issues
4. Check console for React warnings

### **E2E Test Failures**
1. Review Playwright trace files
2. Check screenshots for visual clues
3. Verify test environment matches production
4. Look for timing/race conditions

### **Database Test Failures**
1. Check Supabase connection
2. Verify test data cleanup
3. Review database constraints
4. Check RLS policies

### **Performance Test Failures**
1. Compare baseline metrics
2. Check for database query changes
3. Review Edge Function modifications
4. Monitor resource usage

## 📈 **Test Maintenance**

### **Weekly Tasks**
- Review test execution times
- Update visual regression baselines
- Check test coverage reports
- Update test data fixtures

### **Monthly Tasks**
- Performance baseline updates
- Test suite optimization
- Dependency updates
- Documentation review

### **Best Practices**
- Keep tests independent and isolated
- Use descriptive test names
- Mock external dependencies
- Test both happy path and edge cases
- Maintain test data quality
- Regular cleanup of test artifacts

## 📝 **Writing New Tests**

### **Component Tests**
```typescript
// tests/components/MyComponent.test.tsx
import { render, screen } from '@testing-library/react';
import MyComponent from '@/components/MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

### **E2E Tests**
```typescript
// tests/e2e/my-feature.spec.ts
import { test, expect } from '@playwright/test';

test('should complete user flow', async ({ page }) => {
  await page.goto('/my-page');
  await page.click('[data-testid="button"]');
  await expect(page.locator('[data-testid="result"]')).toBeVisible();
});
```

### **Database Tests**
```typescript
// tests/database/my-table.test.ts
import { supabase } from '../test-utils/supabase';

describe('MyTable', () => {
  it('should insert data correctly', async () => {
    const { data, error } = await supabase
      .from('my_table')
      .insert({ field: 'value' });
    
    expect(error).toBeNull();
    expect(data).toBeDefined();
  });
});
```

---

*This test suite ensures the session tracking system is reliable, performant, and provides excellent user experience through comprehensive automated validation.*