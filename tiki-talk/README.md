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
