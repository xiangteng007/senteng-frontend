import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
    test('should show login page for unauthenticated users', async ({ page }) => {
        await page.goto('/');

        // Should redirect to login or show login button
        await expect(page.locator('text=登入').or(page.locator('text=Login'))).toBeVisible({
            timeout: 10000,
        });
    });

    test('should display Google sign-in button', async ({ page }) => {
        await page.goto('/');

        // Look for Google sign-in button
        const googleButton = page.locator('button:has-text("Google")');
        await expect(googleButton.or(page.locator('[aria-label*="Google"]'))).toBeVisible({
            timeout: 10000,
        });
    });
});

test.describe('Navigation', () => {
    test('should have proper page title', async ({ page }) => {
        await page.goto('/');

        // Check page has a title
        await expect(page).toHaveTitle(/盛騰|Senteng|ERP/i, { timeout: 10000 });
    });

    test('should be responsive on mobile', async ({ page }) => {
        // Set mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('/');

        // Page should still be interactive
        await expect(page.locator('body')).toBeVisible();
    });
});
