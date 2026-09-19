# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e.spec.ts >> TradeForge E2E >> should navigate to sign in page
- Location: tests\e2e.spec.ts:14:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.waitForURL: Test timeout of 30000ms exceeded.
=========================== logs ===========================
waiting for navigation to "**/sign-in**" until "load"
  navigated to "http://localhost:3000/login"
============================================================
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - button "Open Next.js Dev Tools" [ref=e7] [cursor=pointer]
  - alert [ref=e11]
  - generic [ref=e13]:
    - generic [ref=e14]:
      - generic [ref=e15]: Sign in to TradeForge
      - generic [ref=e16]: Enter your credentials to access your terminal
    - generic [ref=e18]:
      - generic [ref=e19]:
        - text: Email
        - textbox "Email" [ref=e20]:
          - /placeholder: trader@example.com
      - generic [ref=e21]:
        - text: Password
        - textbox "Password" [ref=e22]:
          - /placeholder: ••••••••
      - button "Sign In" [ref=e23] [cursor=pointer]
    - generic [ref=e25]:
      - text: Don't have an account?
      - button "Create one" [ref=e26] [cursor=pointer]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('TradeForge E2E', () => {
  4  |   test('should render the landing page', async ({ page }) => {
  5  |     await page.goto('/');
  6  |     
  7  |     // Check if the logo/brand is visible
  8  |     await expect(page.locator('text=TradeForge').first()).toBeVisible();
  9  |     
  10 |     // Check if sign in button is visible
  11 |     await expect(page.locator('text=Sign In').first()).toBeVisible();
  12 |   });
  13 | 
  14 |   test('should navigate to sign in page', async ({ page }) => {
  15 |     await page.goto('/');
  16 |     
  17 |     const signInBtn = page.locator('text=Sign In').first();
  18 |     await signInBtn.click();
  19 |     
  20 |     // Since Next.js is configured for client-side navigation in Next 15 App router, 
  21 |     // wait for URL change
> 22 |     await page.waitForURL('**/sign-in**');
     |                ^ Error: page.waitForURL: Test timeout of 30000ms exceeded.
  23 |     
  24 |     // Check for email input or text
  25 |     await expect(page.locator('input[type="email"]')).toBeVisible();
  26 |   });
  27 | });
  28 | 
```