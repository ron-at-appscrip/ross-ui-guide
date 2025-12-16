import { test, expect } from '@playwright/test';

test.describe('Session Tracking E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set up test user and clean state
    await page.goto('/login');
  });

  test('should track session start event on login', async ({ page }) => {
    // Login flow
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    // Wait for redirect to dashboard
    await page.waitForURL('/dashboard');
    
    // Navigate to Sessions page
    await page.click('[data-testid="sessions-nav"]');
    await page.waitForURL('/dashboard/sessions');
    
    // Verify session appears in active sessions
    await expect(page.locator('[data-testid="active-sessions"]')).toBeVisible();
    await expect(page.locator('[data-testid="session-item"]')).toHaveCount(1);
    
    // Verify session has "Current" badge
    await expect(page.locator('[data-testid="current-session-badge"]')).toBeVisible();
    
    // Verify session statistics are displayed
    await expect(page.locator('[data-testid="total-sessions-stat"]')).toBeVisible();
    await expect(page.locator('[data-testid="active-sessions-stat"]')).toContainText('1');
  });

  test('should display session analytics correctly', async ({ page }) => {
    await loginUser(page);
    await page.goto('/dashboard/sessions');
    
    // Wait for data to load
    await page.waitForSelector('[data-testid="session-stats"]');
    
    // Verify stats are numbers
    const totalSessions = await page.textContent('[data-testid="total-sessions-stat"]');
    const activeSessions = await page.textContent('[data-testid="active-sessions-stat"]');
    
    expect(parseInt(totalSessions || '0')).toBeGreaterThanOrEqual(0);
    expect(parseInt(activeSessions || '0')).toBeGreaterThanOrEqual(0);
    
    // Verify session details are formatted correctly
    await expect(page.locator('[data-testid="session-started-time"]')).toBeVisible();
    await expect(page.locator('[data-testid="session-device-info"]')).toBeVisible();
  });

  test('should handle session termination', async ({ page }) => {
    // Setup multiple sessions scenario (simulate by creating test data)
    await loginUser(page);
    await page.goto('/dashboard/sessions');
    
    // If there are non-current sessions, test termination
    const terminateButtons = page.locator('[data-testid="terminate-session-btn"]');
    const buttonCount = await terminateButtons.count();
    
    if (buttonCount > 0) {
      await terminateButtons.first().click();
      
      // Verify confirmation or immediate action
      await page.waitForTimeout(1000);
      
      // Verify session is removed from active list
      const newButtonCount = await terminateButtons.count();
      expect(newButtonCount).toBe(buttonCount - 1);
    }
  });

  test('should handle current session sign out', async ({ page }) => {
    await loginUser(page);
    await page.goto('/dashboard/sessions');
    
    // Click sign out on current session
    await page.click('[data-testid="signout-current-session-btn"]');
    
    // Verify redirect to login page
    await page.waitForURL('/login');
    
    // Verify user is logged out
    await expect(page.locator('[data-testid="login-form"]')).toBeVisible();
  });

  test('should refresh session data correctly', async ({ page }) => {
    await loginUser(page);
    await page.goto('/dashboard/sessions');
    
    // Get initial session count
    const initialSessions = await page.locator('[data-testid="session-item"]').count();
    
    // Click refresh button
    await page.click('[data-testid="refresh-sessions-btn"]');
    
    // Wait for loading indicator
    await expect(page.locator('[data-testid="loading-indicator"]')).toBeVisible();
    await expect(page.locator('[data-testid="loading-indicator"]')).not.toBeVisible();
    
    // Verify data is still displayed correctly
    const newSessions = await page.locator('[data-testid="session-item"]').count();
    expect(newSessions).toBeGreaterThanOrEqual(initialSessions);
  });

  test('should handle error states gracefully', async ({ page }) => {
    // Mock API failure
    await page.route('**/functions/v1/track-session', route => 
      route.fulfill({ status: 500, body: 'Server Error' })
    );
    
    await loginUser(page);
    await page.goto('/dashboard/sessions');
    
    // Verify error handling doesn't break the UI
    await expect(page.locator('[data-testid="sessions-page"]')).toBeVisible();
    
    // Check if fallback data is shown
    await expect(page.locator('[data-testid="session-item"], [data-testid="no-sessions-message"]')).toBeVisible();
  });

  // Helper function
  async function loginUser(page: any) {
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/dashboard');
  }
});