import { expect, test, type Page } from '@playwright/test';

// The floating pill has to hold six tabs on a 390px iPhone without overflowing
// or clipping a label.
const EMAIL = process.env.E2E_EMAIL || 'rn-roundtrip-1788951465051@gmail.com';
const PASSWORD = process.env.E2E_PASSWORD || 'TestPass123!';

async function signIn(page: Page) {
  await page.goto('./');
  const email = page.locator('#email');
  if (await email.isVisible().catch(() => false)) {
    await email.fill(EMAIL);
    await page.locator('#password').fill(PASSWORD);
    await page.getByRole('button', { name: /sign in/i }).click();
  }
  await page.locator('.nav').waitFor({ state: 'visible', timeout: 20_000 });
}

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
