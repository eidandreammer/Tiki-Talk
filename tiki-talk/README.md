# Tiki Talk

This Vite app now submits the two landing-page email forms to n8n so each form can be saved in a different Google Sheet.

## Webhook configuration

Create a local `.env` file from [.env.example](.env.example):

```powershell
Copy-Item .env.example .env
```

Set both webhook URLs:

```env
VITE_N8N_NEWSLETTER_WEBHOOK_URL=https://your-n8n-host/webhook/tiki-talk/newsletter
VITE_N8N_CLUB_WEBHOOK_URL=https://your-n8n-host/webhook/tiki-talk/club
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
run serverless functions from the `api/` folder. The Pages workflow runs
`npm run generate:ticker` after the Vite build to create a static JSON response
at `/api/soccer-ticker`, then refreshes the deployment hourly. Add the
`APISPORTS_KEY` repository secret in GitHub Actions so that step can fetch
current fixtures without exposing the key to the browser bundle.

## n8n workflow

Import [n8n/tiki-talk-google-sheets-capture.json](n8n/tiki-talk-google-sheets-capture.json) into n8n and then follow [docs/n8n-google-sheets-setup.md](docs/n8n-google-sheets-setup.md).

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
