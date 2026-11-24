import { defineConfig } from '@playwright/test';

/**
 * DNS Quest is a static vanilla site — no build step.
 * The webServer below boots scripts/serve.mjs on :8080 so tests (and the
 * Playwright MCP server workflow) always have the game available.
 */
export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:8080',
    headless: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure'
  },
  webServer: {
    command: 'node scripts/serve.mjs 8080',
    url: 'http://127.0.0.1:8080/',
    reuseExistingServer: !process.env.CI,
    timeout: 15_000
  },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }]
});
