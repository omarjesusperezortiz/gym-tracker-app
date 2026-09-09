import type { Page } from '@playwright/test';

export const EMAIL = process.env.E2E_EMAIL || 'rn-roundtrip-1788951465051@gmail.com';
export const PASSWORD = process.env.E2E_PASSWORD || 'TestPass123!';

// Signed-in users with onboarded:false get the wizard instead of the tabs, so
// specs that exercise the app stub the prefs row as already onboarded. Stubbing
// (rather than completing the wizard for real) keeps these specs from writing
// to the shared test account.
const ONBOARDED_PREFS = {
  units: 'kg',
  default_plan: 'gym',
  rest_seconds: 90,
  display_name: null,
  sex: null,
  birth_year: null,
  height_cm: null,
  goal_weight_kg: null,
  goal: 'muscle',
  focus_muscles: [],
  experience: 'intermediate',
  days_per_week: 4,
  session_min: 60,
  equipment: 'full_gym',
  onboarded: true,
};

export async function stubOnboarded(page: Page, prefs: Record<string, unknown> = {}) {
  await page.route(/\/rest\/v1\/user_prefs\?/, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ...ONBOARDED_PREFS, ...prefs }),
    })
  );
}

// Signs in (if the form is showing) and waits for the app shell.
export async function signIn(page: Page, prefs: Record<string, unknown> = {}) {
  await stubOnboarded(page, prefs);
  await page.goto('./');
  const email = page.locator('#email');
  if (await email.isVisible().catch(() => false)) {
    await email.fill(EMAIL);
    await page.locator('#password').fill(PASSWORD);
    await page.getByRole('button', { name: /sign in/i }).click();
  }
  await page.locator('.nav').waitFor({ state: 'visible', timeout: 20_000 });
}
