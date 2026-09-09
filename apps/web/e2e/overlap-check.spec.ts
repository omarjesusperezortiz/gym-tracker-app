import { test } from '@playwright/test';
import { signIn } from './helpers';



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
