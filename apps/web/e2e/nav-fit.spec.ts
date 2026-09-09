import { expect, test } from '@playwright/test';
import { signIn } from './helpers';

// The floating pill has to hold six tabs on a 390px iPhone without overflowing
// or clipping a label.
test('six-tab nav fits the viewport with no clipped labels', async ({ page }) => {
  await signIn(page);

  const viewport = page.viewportSize()!;
  const nav = page.locator('.nav');
  const navBox = (await nav.boundingBox())!;
  const items = page.locator('.nav .ni');

  expect(await items.count()).toBe(6);
  // The pill stays inside the screen.
  expect(navBox.x).toBeGreaterThanOrEqual(0);
  expect(navBox.x + navBox.width).toBeLessThanOrEqual(viewport.width);
  // And its items actually fit in it (no horizontal overflow inside the pill).
  const overflow = await nav.evaluate((el) => el.scrollWidth - el.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);

  // Every label renders on one line, untruncated.
  for (let i = 0; i < 6; i++) {
    const label = items.nth(i).locator('span');
    const metrics = await label.evaluate((el) => ({
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
      lines: el.getClientRects().length,
      text: el.textContent,
    }));
    expect(metrics.lines, `${metrics.text} wraps`).toBe(1);
    expect(metrics.scrollWidth - metrics.clientWidth, `${metrics.text} is clipped`).toBeLessThanOrEqual(1);
  }

  console.log(
    `viewport ${viewport.width}px · nav ${navBox.width.toFixed(1)}px (${(viewport.width - navBox.width).toFixed(1)}px spare)`
  );
});
