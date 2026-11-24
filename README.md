# DNS Quest

A Zork-style interactive fiction + live network visualizer that teaches how
DNS resolution works (OCR GCSE CS J277). Players act as the DNS Packet
Dispatcher, guiding `https://www.gcse-cs.co.uk` from the browser through the
local cache, ISP recursive resolver, root, `.uk` TLD and authoritative name
servers until the page loads — then demo a warm-cache hit.

**100% vanilla HTML/CSS/JS, no build step** — the repo root is the website, so
it can be statically hosted on GitHub Pages as-is. See `SPEC.md` for the full
game design (stages 0–9, node states, parser commands).

## Run it

```bash
node scripts/serve.mjs 8080     # then open http://127.0.0.1:8080/
```

Any static file server works (`python3 -m http.server`, `npx serve`, …).

## Dev container (recommended)

Open this folder in VS Code → **"Reopen in Container"** (or create a
Codespace). The devcontainer (`.devcontainer/`) gives you Node 20, git,
**GitHub CLI**, **Playwright + Chromium**, and the **Playwright MCP server**,
and auto-serves the game on forwarded port **8080**. Details:
[`.devcontainer/README.md`](.devcontainer/README.md)

## Test & verify (for humans and agents)

```bash
npx playwright test                          # E2E tests (auto-starts the server on :8080)
npx playwright-mcp --browser chromium        # MCP server: drive a real browser against the game
```

The `playwright` MCP server is preconfigured in [`.vscode/mcp.json`](.vscode/mcp.json).
`tests/smoke.spec.js` has always-on smoke tests plus a `test.skip` scaffold
mapped to the stages in `SPEC.md` — un-skip as features land.

## Deploy to GitHub Pages

`.github/workflows/pages.yml` deploys the repo root on every push to
`main`/`master` (no build step). In repo **Settings → Pages → Source** choose
**GitHub Actions** once, then push. `gh repo view --web` / `gh pages` commands
are available in the devcontainer after `gh auth login`.

## Layout

```
index.html            # the game (entry point — vanilla, no build)
SPEC.md               # full game specification
scripts/serve.mjs     # zero-dep static server used for local dev + tests
tests/smoke.spec.js   # Playwright smoke tests + SPEC.md acceptance scaffold
playwright.config.mjs # test config (webServer boots scripts/serve.mjs on :8080)
.devcontainer/        # dev container: gh CLI, Playwright, Playwright MCP
.vscode/mcp.json      # preconfigured Playwright MCP server
.github/workflows/pages.yml  # static deploy to GitHub Pages
```
