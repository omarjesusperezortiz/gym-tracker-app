import { test, type Page } from '@playwright/test';

const EMAIL = process.env.E2E_EMAIL || 'rn-roundtrip-1788951465051@gmail.com';
const PASSWORD = process.env.E2E_PASSWORD || 'TestPass123!';

async function signIn(page: Page) {
  await page.goto('./');
  const e = page.locator('#email');
  if (await e.isVisible().catch(() => false)) {
    await e.fill(EMAIL);
    await page.locator('#password').fill(PASSWORD);
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.locator('.nav').waitFor({ state: 'visible', timeout: 15_000 });
  }
}

test('viewport shot scrolled to bottom of Today (real nav overlap check)', async ({ page }) => {
  await signIn(page);
  await page.locator('.nav .ni[data-view="today"]').click();
  await page.waitForTimeout(800);
  // scroll the page all the way down
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(600);
  // viewport-only screenshot (fixed nav renders correctly here)
  await page.screenshot({ path: '/tmp/gt-shots2/viewport-today-bottom.png', fullPage: false });
  // is the Start button fully above the nav?
  const btn = page.getByRole('button', { name: /start this workout/i });
  const nav = page.locator('.nav');
  const bb = await btn.boundingBox();
  const nb = await nav.boundingBox();
  console.log('BUTTON bottom:', bb?.y! + bb?.height!, '| NAV top:', nb?.y);
  console.log('OVERLAP:', (bb && nb) ? (bb.y + bb.height > nb.y ? 'YES — still overlapping' : 'NO — button clears nav') : 'n/a');
});
