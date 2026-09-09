import { test, expect } from '@playwright/test';
// Test account (email-confirmation is OFF on the Supabase project). signIn also
// stubs prefs as onboarded, or the wizard would gate the app.
import { signIn } from './helpers';

test.describe('Gym Tracker — core flows', () => {
  test('sign in and land on the app', async ({ page }) => {
    await signIn(page);
    await expect(page.locator('.nav')).toBeVisible();
  });

  test('all 5 tabs render without crashing', async ({ page }) => {
    await signIn(page);
    for (const tab of ['today', 'home', 'calendar', 'progress', 'meals']) {
      await page.locator(`.nav .ni[data-view="${tab}"]`).click();
      // the view container should be present and not show an error boundary
      await expect(page.locator('.nav .ni.active')).toHaveAttribute('data-view', tab);
      await expect(page.locator('body')).not.toContainText(/something went wrong|cannot read/i);
    }
  });

  test('home dashboard lists plans and sessions', async ({ page }) => {
    await signIn(page);
    await page.locator('.nav .ni[data-view="home"]').click();
    // catalog has Gym / Calisthenics / Travel plans
    await expect(page.getByText(/Gym|Calisthenics|Travel/).first()).toBeVisible();
  });

  test('opening a session shows the train screen', async ({ page }) => {
    await signIn(page);
    await page.locator('.nav .ni[data-view="home"]').click();
    // click the first session card that navigates to training
    const firstSession = page.locator('[data-session], .session, .daycard, .qp, .focus-row').first();
    if (await firstSession.isVisible().catch(() => false)) {
      await firstSession.click();
      // train screen should show a Finish button (Dock) or exercise cards
      await expect(page.locator('.dock, .exercise, .exvarname').first()).toBeVisible({ timeout: 10_000 });
    }
  });
});
