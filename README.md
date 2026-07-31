# My Big Day — codebase
*The wedding planner who knows your traditions.* Prototype v0.28 · 30 July 2026

## Layout
```
src/            App source (built into one self-contained HTML file)
  app1.js       Data, culture engine, onboarding (questions, vignettes, geo-guess)
  app2.js       Main app UI (Home/Budget/Guests/List/Album/More), quotes, scan, cloud sync
  app.css       Champagne Blush design system + question vignettes
packs/          The core IP: 8 researched culture packs + SCHEMA.md data model
fonts/          Subsetted woff2 (Gloock, Outfit, Nothing You Could Do) — inlined at build
build.py        Build: inlines fonts, gzips packs, bundles QR + fflate libs → dist/index.html
dist/           index.html — the complete app, one file, works offline
backend/        Cloudflare Worker API (couples/pairing, plan sync, guest QR album→R2,
                geo, FX, AI scan, suppliers proxy, enquiries) + wrangler.toml with the
                REAL provisioned resource IDs + DEPLOY.md (one command: npx wrangler deploy)
tests/          Playwright end-to-end tests (chromium)
docs/           Brand voice & identity, social ad package, competitor analysis,
                design philosophy, flow review, change log, project resume notes
```

## Build the app
```
python3 build.py        # → dist/index.html (~450KB, self-contained)
```

## Run the tests
```
npm i playwright && node tests/test3.mjs
```

## Deploy the backend (Nick's Cloudflare account — resources already provisioned)
```
cd backend && npx wrangler deploy
```
See backend/DEPLOY.md for secrets (AI scan, Places) and what remains (store accounts).

## Key decisions
£6.99 one-off unlock ("the full fantasy") · religion-first onboarding with geo-suggest ·
supplier search = fixed category parameters + geographic answer · guest QR album → printed
photo book revenue line · Capacitor wrap for the stores (Sprint 3).
