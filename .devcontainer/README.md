# DNS Quest devcontainer

One-command dev environment for building, testing and verifying the game.
Open the project folder in VS Code → "Reopen in Container" (or create a
Codespace). The container is Node 20 + git + GitHub CLI, with Playwright,
Chromium and the Playwright MCP server installed by `post-create.sh`.

## What's inside

| Tool | Purpose | Command |
| :--- | :--- | :--- |
| GitHub CLI (`gh`) | auth, PRs, repo/Pages settings | `gh auth login` |
| Static server (zero-dep Node) | serve the vanilla site locally | `node scripts/serve.mjs 8080` |
| Playwright test runner | E2E tests in `tests/` | `npx playwright test` |
| Playwright MCP server | lets an agent drive a real browser to verify the game | `npx playwright-mcp --browser chromium` |

Port **8080** is forwarded (and the static server is auto-started on every
container start via `postStartCommand`), so the game is immediately at
<http://localhost:8080>.

## Typical agent workflow

1. **Modify** — edit `index.html` / `css/` / `js/` (pure vanilla, no build step).
2. **Serve** — already running on 8080; restart with `node scripts/serve.mjs 8080` if needed.
3. **Verify interactively** — start the Playwright MCP server
   (`npx playwright-mcp --browser chromium`, or use the preconfigured
   `playwright` server in `.vscode/mcp.json`), navigate to
   `http://localhost:8080`, and drive the terminal commands from `SPEC.md`.
4. **Verify automatically** — `npx playwright test` (starts its own server via
   `webServer` in `playwright.config.mjs`). Add cases to `tests/smoke.spec.js`
   as features land; the `test.skip` scaffold there maps to `SPEC.md` stages.
5. **Ship** — commit and push; `.github/workflows/pages.yml` publishes the
   static site to GitHub Pages (no build step — the repo root *is* the site).

## Notes

- The game must stay **vanilla HTML/CSS/JS with no build step** so GitHub
  Pages can host the repo root directly. `package.json`/`tests/` are dev-only
  and harmless when served.
- Install more browsers if needed: `npx playwright install firefox webkit`.
- `gh` is installed but not authenticated — run `gh auth login` once.
