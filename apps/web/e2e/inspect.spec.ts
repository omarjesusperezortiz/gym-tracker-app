import { test, type Page } from '@playwright/test';
import fs from 'node:fs';

const EMAIL = process.env.E2E_EMAIL || 'rn-roundtrip-1788951465051@gmail.com';
const PASSWORD = process.env.E2E_PASSWORD || 'TestPass123!';
const OUT = process.env.SHOT_DIR || '/tmp/gt-shots';

async function signIn(page: Page) {
  await page.goto('./');
  const emailInput = page.locator('#email');
  if (await emailInput.isVisible().catch(() => false)) {
    await emailInput.fill(EMAIL);
    await page.locator('#password').fill(PASSWORD);
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.locator('.nav').waitFor({ state: 'visible', timeout: 15_000 });
  }
}

test('capture all screens for UI/UX inspection', async ({ page }, testInfo) => {
  fs.mkdirSync(OUT, { recursive: true });
  const proj = testInfo.project.name;

  // Sign-in screen first (before auth)
  await page.goto('./');
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${OUT}/${proj}-00-signin.png`, fullPage: true });

  await signIn(page);

  const tabs = ['today', 'home', 'calendar', 'progress', 'meals'];
  for (let i = 0; i < tabs.length; i++) {
    await page.locator(`.nav .ni[data-view="${tabs[i]}"]`).click();
    await page.waitForTimeout(900);
    await page.screenshot({ path: `${OUT}/${proj}-0${i + 1}-${tabs[i]}.png`, fullPage: true });
  }

  // Also capture a training screen
  await page.locator('.nav .ni[data-view="home"]').click();
  await page.waitForTimeout(600);
  const sessionCard = page.locator('[data-session], .session, .daycard, .qp, .focus-row, .card').first();
  if (await sessionCard.isVisible().catch(() => false)) {
    await sessionCard.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${OUT}/${proj}-06-train.png`, fullPage: true });
  }
});
