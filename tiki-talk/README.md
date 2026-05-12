# Tiki Talk

This Vite app submits the two landing-page email forms to n8n so each form can be saved in Google Sheets and emailed to the team.

## Webhook configuration

Create a local `.env` file from [.env.example](.env.example):

```powershell
Copy-Item .env.example .env
```

Set both webhook URLs:

```env
VITE_N8N_NEWSLETTER_WEBHOOK_URL=https://n8n.bitesites.org/webhook/tiki-talk/newsletter
VITE_N8N_CLUB_WEBHOOK_URL=https://n8n.bitesites.org/webhook/tiki-talk/club
```

For local n8n testing, run:

```bash
npm run n8n
```

Use `http://localhost:5678/webhook-test/...` while listening for test events in
the n8n editor, or `http://localhost:5678/webhook/...` after the workflow is
active.

To power the live match ticker, set your API-Sports football key as a server-side
variable. Do not prefix this value with `VITE_`, because Vite exposes those
values to the browser bundle:

```env
APISPORTS_KEY=your-api-sports-key
```

The React app calls `/api/soccer-ticker`, which is backed by a cached proxy in
[api/soccer-ticker.js](api/soccer-ticker.js). The proxy keeps API-Sports calls
server-side, sets CDN cache headers, and returns a client cache duration based on
match state:

- live matches: short cache, around 1 minute in the browser
- upcoming matches: 30-minute cache
- finished or empty ticker: cache longer, up to the next day

If the API route is hosted on a different domain than the Vite app, set:

```env
VITE_SOCCER_TICKER_ENDPOINT=https://your-api-host.example.com/api/soccer-ticker
```

The production site at `tikitalk.us` is deployed on GitHub Pages, which cannot
run serverless functions from the `api/` folder. Scheduled Pages workflow runs
call `npm run generate:ticker` after the Vite build to create a static JSON
response at `/api/soccer-ticker`. The schedule refreshes every 30 minutes, which
makes up to 48 API-Sports fixture calls per day and stays below the 100/day and
10/minute API limits.

Push and manual workflow runs do not call API-Sports. They copy the currently
deployed `https://tikitalk.us/api/soccer-ticker` response into the new Pages
artifact so code deploys can ship without spending a vendor API call. Add the
`APISPORTS_KEY` repository secret in GitHub Actions so scheduled runs can fetch
current fixtures without exposing the key to the browser bundle.

## API-Sports quota guardrails for agents

API-Sports has hard limits of 100 calls per day and 10 calls per minute. Treat
any command that runs `npm run generate:ticker` or calls
`getSoccerTickerResponse()` without a warm cache as a possible billable vendor
API call.

Before making any manual or development API-Sports call, future agents should
check this section and count scheduled production usage first:

```text
# API-Sports call ledger template for AI agents.
# This is a comment-only reminder, not an automatic quota lock.
# Limits:
#   per minute: 10 calls
#   per day: 100 calls
# Scheduled production usage:
#   GitHub Pages refresh: up to 48 calls/day, at minutes 9 and 39 each hour
# Manual/dev usage to account for before calling:
#   current day, America/New_York: 0 calls
#   current minute, America/New_York: 0 calls
```

Agent rules:

- Do not expose the API key to browser code. Use `APISPORTS_KEY`, never
  `VITE_APISPORTS_KEY`.
- Do not run `npm run generate:ticker` just to verify a build. Use
  `npm run build` and `npm run lint` unless live fixture data is required.
- Push and manual Pages workflow runs reuse the deployed ticker JSON and should
  not add API-Sports calls.
- Keep at least 20 calls/day of safety margin for unexpected retries or urgent
  refreshes. With the 48 scheduled calls/day, avoid more than 32 manual
  API-Sports calls/day.
- If unsure whether a command will call API-Sports, inspect the code path before
  running it.

The comment ledger above helps agents reason about the quota, but it cannot
guarantee enforcement because README comments do not run, local process memory
resets, GitHub Actions jobs are isolated, and multiple agents or machines could
make calls at the same time.

For true enforcement, add a persistent quota guard around the vendor fetch in
[server/soccerTicker.js](server/soccerTicker.js). The guard should run before
`fetchFixtures()` and store counters in shared state such as Redis, Vercel KV,
Cloudflare KV, Supabase, or another database:

```js
// Pseudocode only. Do not use an in-memory Map for production quota locks.
const quota = await quotaStore.increment({
  dayKey: 'api-sports:day:YYYY-MM-DD',
  minuteKey: 'api-sports:minute:YYYY-MM-DDTHH:mm',
  ttl: {
    day: secondsUntilTomorrow,
    minute: secondsUntilNextMinute,
  },
})

if (quota.dayCount > 100 || quota.minuteCount > 10) {
  throw new Error('API-Sports quota would be exceeded')
}

const fixtures = await fetchFixtures({ apiKey, dateKey, fetchImpl, signal })
```

When using a persistent quota guard, the API route can fetch the current counter
before each vendor call and refuse the request if the next call would exceed
either limit. On GitHub Pages alone, there is no always-on shared server state,
so the current safe production strategy is to keep vendor calls in the scheduled
build workflow and serve static cached JSON to visitors.

## n8n workflow

Import [n8n/tiki-talk-google-sheets-capture.json](n8n/tiki-talk-google-sheets-capture.json) into n8n and then follow [docs/n8n-google-sheets-setup.md](docs/n8n-google-sheets-setup.md). The workflow path is `Webhook -> Map Lead Data -> Add Row to Google Sheets -> Send Email Notification -> Response` for both newsletter and club submissions.

## Run locally

```bash
npm install
npm run dev
```

Run n8n in a second terminal when testing the forms locally:

```bash
npm run n8n
```

## Global styling and image performance rules

Use these rules for all new UI work so the site stays consistent and fast on
phones, tablets, and desktop displays:

- Build mobile-first styles, then add responsive adjustments with `min-width`
  media queries for larger screens.
- Reuse existing colors, spacing, typography, and component patterns before
  introducing new visual treatments.
- Keep layouts fluid with relative units, `clamp()`, `minmax()`, and flexible
  grid or flex rules instead of fixed desktop-only dimensions.
- Avoid layout shifts by setting stable image dimensions with `width`, `height`,
  `aspect-ratio`, or a constrained wrapper before images load.
- Serve the smallest useful image for each viewport. Prefer responsive
  `srcset`/`sizes` or `<picture>` sources when an image appears at different
  sizes across devices.
- Prefer modern image formats such as WebP or AVIF for production assets, with
  an appropriate fallback if browser support is a concern.
- Compress images before committing them, and keep large originals out of the
  browser bundle unless they are required for production.
- Lazy-load below-the-fold images with `loading="lazy"` and decode non-critical
  images asynchronously with `decoding="async"`.
- Keep above-the-fold hero or feature images optimized and eager enough to avoid
  a slow Largest Contentful Paint. Do not lazy-load the primary LCP image.
- Use descriptive `alt` text for meaningful images and empty `alt=""` for
  decorative images.
- Test important pages at small, medium, and large viewport widths before
  shipping. Confirm that text does not overlap, controls stay tappable, and
  images remain sharp without downloading oversized assets.

## Build path

The production build defaults to root-relative assets, which matches the custom
domain in [public/CNAME](public/CNAME):

```bash
npm run build
```

If you deploy the same build under a subdirectory instead, set `VITE_BASE_PATH`
before building:

```bash
VITE_BASE_PATH=/Tiki-Talk/ npm run build
```
