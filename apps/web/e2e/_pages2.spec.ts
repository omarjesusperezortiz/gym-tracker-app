import { test } from '@playwright/test';
import fs from 'node:fs';
const OUT = '/tmp/gt-pages2';

test('every page fresh', async ({ page }) => {
  fs.mkdirSync(OUT, { recursive: true });
  await page.goto('./'); await page.waitForTimeout(1300);
  await page.screenshot({ path: `${OUT}/00-auth.png` });
  if (await page.locator('#email').isVisible().catch(() => false)) {
    await page.locator('#email').fill('omarjesus.perezortiz@gmail.com');
    await page.locator('#password').fill('Omarmmreay93102!');
    await page.getByRole('button', { name: /sign in/i }).click(); await page.waitForTimeout(3200);
  }
  const skip = page.getByText(/skip for now/i).first();
  if (await skip.isVisible().catch(() => false)) { await skip.click().catch(() => {}); await page.waitForTimeout(1300); }

  const tabs: [string, string][] = [
    ['today', '01-today'], ['home', '02-home'], ['calendar', '03-calendar'],
    ['progress', '04-progress'], ['meals', '05-nutrition'], ['profile', '06-profile'],
  ];
  for (const [t, name] of tabs) {
    await page.locator(`.nav .ni[data-view="${t}"]`).click().catch(() => {});
    await page.waitForTimeout(1500);
    await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(300);
    await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true });
  }

  await page.locator('.nav .ni[data-view="home"]').click().catch(() => {});
  await page.waitForTimeout(800);
  await page.locator('.dayrow').first().click().catch(() => {});
  await page.waitForTimeout(1600);
  await page.screenshot({ path: `${OUT}/07-train.png`, fullPage: true });
});
