# n8n + Google Sheets setup

This project now sends the two landing-page forms to separate n8n webhook endpoints:

- Newsletter form -> `VITE_N8N_NEWSLETTER_WEBHOOK_URL`
- Club form -> `VITE_N8N_CLUB_WEBHOOK_URL`

The importable workflow file is [n8n/tiki-talk-google-sheets-capture.json](../n8n/tiki-talk-google-sheets-capture.json).

## 1. Create the two Google Sheets

Create two spreadsheet documents, one for each form.

Use these exact tab names because the workflow JSON is already configured for them:

- Newsletter spreadsheet tab: `Newsletter`
- Club spreadsheet tab: `Club Members`

Use this exact header row in row `1` for both tabs:

| Email | Submitted At | Page URL | Source | Origin | User Agent |
| --- | --- | --- | --- | --- | --- |

## 2. Import the workflow into n8n

1. Open n8n.
2. Create a new workflow.
3. Use `Import from File`.
4. Select `n8n/tiki-talk-google-sheets-capture.json`.

## 3. Connect Google Sheets credentials

Both Google Sheets nodes are set up to use a Google Sheets OAuth2 credential placeholder named `Google Sheets account`.

After import:

1. Open `Save Newsletter Lead`.
2. Select your real Google Sheets credential.
3. Open `Save Club Lead`.
4. Select the same credential, or a different one if you prefer.

## 4. Replace the spreadsheet IDs

Open each Google Sheets node and replace the placeholder document IDs:

- `Save Newsletter Lead` -> `REPLACE_WITH_NEWSLETTER_SPREADSHEET_ID`
- `Save Club Lead` -> `REPLACE_WITH_CLUB_SPREADSHEET_ID`

You can find the spreadsheet ID in a Google Sheets URL:

`https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`

## 5. Copy the webhook URLs into the Vite app

Create a local `.env` file from `.env.example`.

```powershell
Copy-Item .env.example .env
```

Set the two production webhook URLs from n8n:

```env
VITE_N8N_NEWSLETTER_WEBHOOK_URL=https://your-n8n-host/webhook/tiki-talk/newsletter
VITE_N8N_CLUB_WEBHOOK_URL=https://your-n8n-host/webhook/tiki-talk/club
```

If you are testing against the n8n editor before activating the workflow, use the `test` webhook URLs temporarily instead.

## 6. Activate and test

1. Save and activate the workflow in n8n.
2. Start the Vite app.
3. Submit the newsletter form.
4. Submit the club form.
5. Confirm that each email lands in the correct spreadsheet.

## Payload sent by the website

The frontend posts these fields to n8n:

- `email`
- `source`
- `pageUrl`
- `submittedAt`

The workflow also stores request metadata from the webhook headers:

- `Origin`
- `User Agent`
