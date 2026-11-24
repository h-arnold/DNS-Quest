import { test, expect } from '@playwright/test';

// ---------------------------------------------------------------------------
// Always-on smoke checks: the static shell must serve and parse as HTML.
// These pass today and must keep passing as the game is built.
// ---------------------------------------------------------------------------
test.describe('static shell', () => {
  test('serves index.html at / with 200 and text/html', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
    expect(response?.headers()['content-type']).toContain('text/html');
    await expect(page.locator('html')).toHaveCount(1);
  });

  test('serves the game with no console errors on load', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (err) => errors.push(String(err)));
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await page.goto('/');
    expect(errors).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// SPEC.md acceptance scaffold — un-skip each test as the game is implemented.
// IDs map to the stages/panels described in SPEC.md.
// ---------------------------------------------------------------------------
test.describe('SPEC.md game scaffold (enable as features land)', () => {
  test.skip('two-panel layout: terminal left, network graph right', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#terminal')).toBeVisible();
    await expect(page.locator('#network-graph')).toBeVisible();
  });

  test.skip('HUD shows target domain, unresolved IP, current node, hop counter', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#hud')).toContainText('www.gcse-cs.co.uk');
    await expect(page.locator('#hud')).toContainText('???');
  });

  test.skip('typing LOOK at the prompt prints a node description', async ({ page }) => {
    await page.goto('/');
    await page.locator('#command-input').fill('LOOK');
    await page.keyboard.press('Enter');
    await expect(page.locator('#terminal-output')).not.toBeEmpty();
  });

  test.skip('error move: CONNECT WEBSERVER before resolution is rejected', async ({ page }) => {
    await page.goto('/');
    await page.locator('#command-input').fill('CONNECT WEBSERVER');
    await page.keyboard.press('Enter');
    await expect(page.locator('#terminal-output')).toContainText(/NULL/i);
  });

  test.skip('optimal path Stage 0 -> Stage 8 resolves 172.67.182.44 and loads the page', async ({ page }) => {
    // Drive: CHECK LOCAL CACHE, QUERY RESOLVER, QUERY ROOT, QUERY TLD,
    // QUERY AUTHORITATIVE, FETCH A RECORD, CACHE AND REPLY, CONNECT WEBSERVER.
    await page.goto('/');
    await expect(page.locator('#hud')).toContainText('172.67.182.44');
  });

  test.skip('bonus Stage 9: reload is a cache hit that bypasses the resolver chain', async ({ page }) => {
    // After Stage 8, RELOAD should connect straight to the web server.
  });
});
