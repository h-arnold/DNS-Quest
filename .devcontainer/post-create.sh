#!/usr/bin/env bash
# DNS Quest devcontainer bootstrap.
# Installs the Playwright test runner, Chromium, and the Playwright MCP server
# so an agent (or a human) can modify, test and verify the game in a real browser.
set -euo pipefail
cd "$(dirname "$0")/.."

if [ ! -f package.json ]; then
  npm init -y >/dev/null
fi

# Test runner + browser automation + the Playwright MCP server.
npm install --save-dev @playwright/test @playwright/mcp

# Chromium browser + required OS libraries.
npx playwright install --with-deps chromium

# Sensible git defaults if the user has none (`gh auth login` is still manual).
if [ -z "$(git config --global user.email || true)" ]; then
  git config --global user.email "dns-quest-dev@localhost"
  git config --global user.name "DNS Quest Dev"
fi

echo ""
echo "DNS Quest devcontainer is ready."
echo "  serve the game : node scripts/serve.mjs 8080   (auto-started, forwarded on port 8080)"
echo "  run E2E tests  : npx playwright test"
echo "  Playwright MCP : npx playwright-mcp --browser chromium   (preconfigured in .vscode/mcp.json)"
echo "  GitHub CLI     : gh auth login"
