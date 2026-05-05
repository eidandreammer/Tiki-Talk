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

## n8n workflow

Import [n8n/tiki-talk-google-sheets-capture.json](n8n/tiki-talk-google-sheets-capture.json) into n8n and then follow [docs/n8n-google-sheets-setup.md](docs/n8n-google-sheets-setup.md).

## Run locally

```bash
npm install
npm run dev
```
