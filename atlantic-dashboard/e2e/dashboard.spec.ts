import { test, expect } from '@playwright/test';

test.describe('Dashboard Flow', () => {
    test.beforeEach(async ({ page }) => {
        // Mock API endpoints
        await page.route('*/**/api/billing/usage', async route => {
            await route.fulfill({
                json: {
                    period_start: "2024-01-01",
                    period_end: "2024-02-01",
                    data_transferred_bytes: 2469606195, // 2.3 GB
                    requests_made: 500,
                    ads_blocked: 120,
                    threats_blocked: 5,
                    active_connections: 1
                }
            });
        });

        await page.route('*/**/api/billing/subscription', async route => {
            await route.fulfill({
                json: {
                    subscription: { id: "sub_1", plan_id: "basic", status: "active", start_date: "2024-01-01", end_date: "2024-02-01", auto_renew: true },
                    plan: { id: "basic", name: "Team Plan", price_monthly: 29, price_annual: 290, data_limit_mb: 5120, request_limit: 1000000, concurrent_conns: 10, features: [] }
                }
            });
        });

        // Mock auth token to bypass login redirect
        await page.addInitScript(() => {
            window.localStorage.setItem('auth_token', 'mock-token');
        });
        await page.goto('/dashboard');
    });

    test('should load dashboard components', async ({ page }) => {
        const main = page.locator('main');

        // Verify Title
        await expect(main.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

        // Verify key cards present
        await expect(main.getByText('Connection Status')).toBeVisible();
        // Use loose matching or scoped for 'Usage' to avoid conflict with Sidebar
        await expect(main.locator('div').filter({ hasText: /^Usage$/ }).first()).toBeVisible();
        await expect(main.getByText('Quick Actions')).toBeVisible();
        await expect(main.getByText('Recent Activity')).toBeVisible();
    });

    test('should show usage stats', async ({ page }) => {
        const main = page.locator('main');
        // UsageStatsCard logic: "2.3 GB / 5 GB (46%)"
        await expect(main.getByText('2.3 GB / 5 GB')).toBeVisible();
    });
});
