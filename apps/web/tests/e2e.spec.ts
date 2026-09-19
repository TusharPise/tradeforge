import { test, expect } from '@playwright/test';

test.describe('TradeForge E2E', () => {
  test('should render the landing page', async ({ page }) => {
    await page.goto('/');
    
    // Check if the logo/brand is visible
    await expect(page.locator('text=TradeForge').first()).toBeVisible();
    
    // Check if sign in button is visible
    await expect(page.locator('text=Sign In').first()).toBeVisible();
  });

  test('should navigate to sign in page', async ({ page }) => {
    await page.goto('/');
    
    const signInBtn = page.locator('text=Sign In').first();
    await signInBtn.click();
    
    // Since Next.js is configured for client-side navigation in Next 15 App router, 
    // wait for URL change
    await page.waitForURL('**/login**');
    
    // Check for email input or text
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });
});
