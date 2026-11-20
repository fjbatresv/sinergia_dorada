# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Static marketing site for Sinergia Dorada (nonprofit, dog-assisted therapy in Guatemala). Vanilla HTML/CSS/JS, no framework. Deployed to AWS S3 + CloudFront. User-facing copy, code comments, test names and CodeRabbit reviews are in **Spanish**; keep that convention.

## Commands

```bash
npm run build            # copy vendors to dist/vendor + esbuild bundles (IIFE, minified, sourcemaps) to dist/
npm test                 # vitest (jsdom), single run
npx vitest --no-watch tests/dogs.test.js        # single test file
npx vitest --no-watch -t "setSectionVisibility" # single test by name
npm run test:coverage    # v8 coverage -> coverage/lcov.info (used by SonarCloud)
npm run test:axe         # axe-core accessibility check against index.html and 404.html
npm run lint             # eslint scripts/**/*.js
npm run format           # prettier --write (format:check in CI)
npm run validate:html    # html-validate index.html 404.html
npm run check:links      # verifies local href/src in index.html and 404.html exist on disk (needs a build first: dist/ is referenced)
npm run ci               # everything above + build
```

Local preview: run `npm run build`, then serve the repo root over HTTP (`python3 -m http.server 8000` or `npx serve`). `index.html` loads `dist/*.js` and `dist/vendor/*`, so a build is required; `file://` breaks the JSON fetch.

Pre-commit (Husky + lint-staged) runs prettier, `eslint --fix`, and the full vitest suite when `scripts/**/*.js` is staged.

## Architecture

- **`index.html`** is the single page. All sections exist statically in the HTML; JS fills/toggles them. It loads `dist/ui.js`, `dist/content.js`, `dist/dogs.js`, `dist/sentry.js` (all `defer`), plus vendored Font Awesome and wordcloud2 from `dist/vendor/` (served locally to avoid third-party cookies). Google Analytics is loaded inline in `index.html`.
- **`scripts/*.js` are ES module sources; `dist/` is the build output** (gitignored). Each source is bundled independently by esbuild as an IIFE — there is no shared runtime between bundles; they communicate only through the DOM.
- **Content is data-driven**: `content/site-content.json` (section on/off flags in `sections`, navigation, hero collage `floatingItems`, statistics, partners, testimonials, section texts) and `content/dogs.json` (dog carousel + modal). Prefer editing JSON over HTML for content changes.
  - `content.js` / `dogs.js` `import` the JSON as a bundled fallback, render it immediately, then fetch the live JSON over the network (`content.js` falls back to XHR) and re-render. So JSON edits work both bundled and fetched.
- Each script self-initializes on `DOMContentLoaded` and also `export`s its functions so tests can import them directly. Network loading is skipped under Vitest (`__VITEST__` / `process.env.VITEST` checks) — preserve these guards when changing init code.
- `ui.js` expects `<ul id="nav-list" class="nav-list">`; selectors are shared with `content.js`.
- **Sentry**: `scripts/sentry.js` reads DSN/env/release from `data-sentry-*` attributes on its own `<script>` tag (placeholders `__SENTRY_DSN__` / `__SENTRY_RELEASE__`), lazily loads `dist/sentry-sdk.js` (built from `scripts/sentry-sdk.js`, which re-exports only `init`/`browserTracingIntegration`/`replayIntegration` from `@sentry/browser` onto `globalThis.Sentry`; if `sentry.js` needs more SDK APIs, add them there). No CDN fallback. No-ops in tests or with a placeholder DSN. Excluded from coverage.
- `scripts/copy-vendor.js` and `scripts/check-links.js` are Node build/CI tools, not browser code.

## Tests

Vitest + jsdom + `@testing-library/jest-dom` (`tests/setup.js`). Tests build DOM fixtures via `document.body.innerHTML` and call exported functions. Coverage targets ~>80% statements/branches on `content.js`, `dogs.js`, `ui.js` (SonarCloud quality gate on PRs). `tests/accessibility.test.js` loads the real `index.html` into JSDOM with `color-contrast` disabled — HTML changes must keep axe clean.

## CI / Deploy

- PRs to `main`/`develop` (`test.yml`): lint, format check, html-validate, build, link check, coverage, axe. `sonar.yml` runs SonarCloud.
- Push to `main` (`deploy.yml`, environment `production`, one at a time): copies repo to `/tmp/site`, optimizes images with ImageMagick, builds, injects `__SENTRY_DSN__`/`__SENTRY_RELEASE__` into `index.html`, runs checks, uploads sourcemaps to Sentry only (not S3), syncs to S3 with per-type cache (7d for assets/docs/vendor, 5 min for `dist/*.js`/styles/content, 60s for `index.html`; nothing is `immutable` because filenames are not hashed), invalidates CloudFront, and creates an auto-incremented patch tag/GitHub release.
- All actions are pinned by commit SHA with a `# vX.Y.Z` comment, and the repo enforces SHA pinning; keep that format when adding actions. Workflows default to `contents: read`.
- `main` is protected by a ruleset: changes go through PRs and the `lint` and `test` checks must pass.
- Never commit a real Sentry DSN; `index.html` must keep the `__SENTRY_DSN__` and `__SENTRY_RELEASE__` placeholders (deploy fails without them).
