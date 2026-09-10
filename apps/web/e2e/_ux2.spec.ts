import { test } from '@playwright/test';
import fs from 'node:fs';
const OUT = '/tmp/gt-ux2';

// Viewport-scroll capture (390px WebKit). For each screen: scroll top→bottom
// one viewport-minus-overlap at a time so nothing hides behind the fixed nav.
async function scrollShots(page, prefix, maxShots = 5) {
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(350);
  let prev = -1;
  for (let i = 0; i < maxShots; i++) {
    await page.screenshot({ path: `${OUT}/${prefix}-${i}.png` });
    const y = await page.evaluate(() => window.scrollY);
    await page.evaluate(() => window.scrollBy(0, window.innerHeight - 110));
    await page.waitForTimeout(450);
    const ny = await page.evaluate(() => window.scrollY);
    if (ny === y || ny === prev) break;
    prev = y;
  }
}

async function login(page) {
  await page.goto('./'); await page.waitForTimeout(1300);
  if (await page.locator('#email').isVisible().catch(() => false)) {
    await page.locator('#email').fill('omarjesus.perezortiz@gmail.com');
    await page.locator('#password').fill('Omarmmreay93102!');
    await page.getByRole('button', { name: /sign in/i }).click(); await page.waitForTimeout(3200);
  }
  const skip = page.getByText(/skip for now/i).first();
  if (await skip.isVisible().catch(() => false)) { await skip.click().catch(() => {}); await page.waitForTimeout(1300); }
}

test('populated account — all tabs', async ({ page }) => {
  fs.mkdirSync(OUT, { recursive: true });
  await login(page);
  for (const t of ['today', 'home', 'calendar', 'progress', 'meals', 'profile']) {
    await page.locator(`.nav .ni[data-view="${t}"]`).click().catch(() => {});
    await page.waitForTimeout(1300);
    await scrollShots(page, `tab-${t}`, t === 'profile' ? 6 : t === 'progress' ? 5 : 3);
  }
  // Train screen + set logging
  await page.locator('.nav .ni[data-view="home"]').click().catch(() => {});
  await page.waitForTimeout(800);
  await page.locator('.dayrow').first().click().catch(() => {});
  await page.waitForTimeout(1500);
  await scrollShots(page, 'train', 4);
  // Add-exercise sheet
  const add = page.getByRole('button', { name: /add exercise/i }).first();
  if (await add.isVisible().catch(() => false)) {
    await add.scrollIntoViewIfNeeded().catch(() => {});
    await add.click().catch(() => {});
    await page.waitForTimeout(900);
    await page.screenshot({ path: `${OUT}/sheet-0.png` });
  }
});

test('auth screen', async ({ page }) => {
  fs.mkdirSync(OUT, { recursive: true });
  await page.context().clearCookies();
  await page.goto('./'); await page.waitForTimeout(1500);
  await page.screenshot({ path: `${OUT}/auth-0.png` });
});
