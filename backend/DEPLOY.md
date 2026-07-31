# Wedding App API — deploy guide

## What's already done (30 Jul 2026)
The infrastructure is **already provisioned on your Cloudflare account** and the code is complete and tested:

| Resource | Name | ID |
|---|---|---|
| D1 database (schema applied) | wedding-app | 49cbc7dc-92e7-4be5-8132-8ef23898e2bf |
| R2 bucket (guest photos) | wedding-app-albums | — |
| KV namespace (FX + supplier cache) | wedding-app-cache | 883274f452fc44e787ae38d4ab807ab1 |

`wrangler.toml` already points at all three. Every endpoint has been smoke-tested locally:
couple creation → plan sync (two-way, two devices) → pairing → guest album page → photo upload to R2 → serve → geo → FX → enquiries → graceful 503s where secrets are missing.

## The one thing only you can do — deploy (≈60 seconds)
On your Mac, in this `backend` folder:

```
npx wrangler deploy
```

(Log in with `npx wrangler login` first if asked — same account as Paulina's app.)
That publishes to **https://wedding-app-api.nicknicola182.workers.dev**, which is the URL already baked into the app — partner sync, cloud backup and the live guest QR album start working the moment it's live.

## Optional secrets (each unlocks one feature, app degrades gracefully without)
```
npx wrangler secret put ANTHROPIC_API_KEY      # AI reading of scanned quotes/invoices (console.anthropic.com)
npx wrangler secret put GOOGLE_PLACES_API_KEY  # in-app supplier results (console.cloud.google.com — enable Places API New)
```

## Still on your list (not deployable by anyone but you)
- Apple Developer Program — $99/yr — developer.apple.com (needed for TestFlight + App Store)
- Google Play Console — $25 once — play.google.com/console
- When ready to send enquiry emails outbound: a Resend.com key (free tier) — endpoint already stores enquiries.

## Endpoints
| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | /api/health | – | liveness |
| POST | /api/couple | – | create couple → id, token, pairCode |
| POST | /api/pair | – | join with pairing code |
| GET/PUT | /api/plan | Bearer id:token | plan sync (last write wins) |
| GET | /album/:id | – | guest upload page (what the QR opens) |
| POST | /album/:id/upload | – | guest photo → R2 |
| GET | /album/:id/list | – | album contents |
| GET | /album/photo/:key | – | serve photo |
| GET | /api/geo | – | country/city from Cloudflare edge (free) |
| GET | /api/fx?base=GBP | – | live FX, KV-cached 24h (free) |
| POST | /api/scan | Bearer | AI document extraction (needs ANTHROPIC_API_KEY) |
| GET | /api/suppliers?q=&where= | – | Places results (needs GOOGLE_PLACES_API_KEY) |
| POST | /api/enquiry | Bearer | store enquiry |
