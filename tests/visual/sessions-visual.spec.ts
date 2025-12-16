import { test, expect } from '@playwright/test';

test.describe('Sessions Page Visual Tests', () => {
  test('should render sessions page correctly', async ({ page }) => {
    // Login and navigate to sessions
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/dashboard');
    await page.goto('/dashboard/sessions');

    // Wait for data to load
    await page.waitForSelector('[data-testid="session-stats"]');
    
    // Take screenshot of the full page
    await expect(page).toHaveScreenshot('sessions-page-full.png', {
      fullPage: true,
      threshold: 0.2 // Allow 20% difference
    });
  });

  test('should render session statistics cards correctly', async ({ page }) => {
    await loginAndNavigateToSessions(page);
    
    // Screenshot just the stats section
    const statsSection = page.locator('[data-testid="session-stats"]');
    await expect(statsSection).toHaveScreenshot('session-stats.png');
  });

  test('should render active sessions correctly', async ({ page }) => {
    await loginAndNavigateToSessions(page);
    
    // Screenshot active sessions section
    const activeSessions = page.locator('[data-testid="active-sessions"]');
    await expect(activeSessions).toHaveScreenshot('active-sessions.png');
  });

  test('should render session history correctly', async ({ page }) => {
    await loginAndNavigateToSessions(page);
    
    // Screenshot session history section
    const sessionHistory = page.locator('[data-testid="session-history"]');
    await expect(sessionHistory).toHaveScreenshot('session-history.png');
  });

  test('should render empty state correctly', async ({ page }) => {
    // Mock empty response
    await page.route('**/functions/v1/get-session-history', route =>
      route.fulfill({ 
        status: 200, 
        body: JSON.stringify({ sessions: [], total_count: 0 })
      })
    );

    await loginAndNavigateToSessions(page);
    
    // Wait for empty state to appear
    await page.waitForSelector('[data-testid="no-sessions-message"]');
    
    // Screenshot empty state
    await expect(page.locator('[data-testid="session-history"]')).toHaveScreenshot('sessions-empty-state.png');
  });

  test('should render loading state correctly', async ({ page }) => {
    // Delay the API response to capture loading state
    await page.route('**/functions/v1/get-session-history', route =>
      new Promise(resolve => 
        setTimeout(() => resolve(route.fulfill({ 
          status: 200, 
          body: JSON.stringify({ sessions: [], total_count: 0 })
        })), 2000)
      )
    );

    await loginAndNavigateToSessions(page);
    
    // Capture loading state immediately
    await expect(page.locator('[data-testid="loading-indicator"]')).toHaveScreenshot('sessions-loading.png');
  });

  test('should render error state correctly', async ({ page }) => {
    // Mock error response
    await page.route('**/functions/v1/get-session-history', route =>
      route.fulfill({ status: 500, body: 'Server Error' })
    );

    await loginAndNavigateToSessions(page);
    
    // Wait for error state
    await page.waitForSelector('[data-testid="error-message"]');
    
    // Screenshot error state
    await expect(page.locator('[data-testid="session-history"]')).toHaveScreenshot('sessions-error-state.png');
  });

  test('should render mobile view correctly', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await loginAndNavigateToSessions(page);
    
    // Mobile layout screenshot
    await expect(page).toHaveScreenshot('sessions-mobile.png', {
      fullPage: true
    });
  });

  test('should render tablet view correctly', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await loginAndNavigateToSessions(page);
    
    // Tablet layout screenshot
    await expect(page).toHaveScreenshot('sessions-tablet.png', {
      fullPage: true
    });
  });

  // Helper function
  async function loginAndNavigateToSessions(page: any) {
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/dashboard');
    await page.goto('/dashboard/sessions');
    await page.waitForSelector('[data-testid="session-stats"]');
  }
});