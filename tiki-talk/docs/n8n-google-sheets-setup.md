# n8n + Google Sheets + Gmail setup

This project sends the two landing-page forms to separate n8n webhook endpoints:

- Newsletter form -> `VITE_N8N_NEWSLETTER_WEBHOOK_URL`
- Club form -> `VITE_N8N_CLUB_WEBHOOK_URL`

The importable workflow file is [n8n/tiki-talk-google-sheets-capture.json](../n8n/tiki-talk-google-sheets-capture.json). Each webhook maps the incoming form body, appends a row to Google Sheets, sends a Gmail notification, then returns a JSON success response to the website.

## 1. Create the Google Sheet

Create one spreadsheet document with these two tabs:

- `Newsletter`
- `Club Members`

Use this exact header row in row `1` for both tabs:

| Email | Form Type | Source | Source URL | Submitted At | Date Sent | Execution Mode | Origin | User Agent |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |

## 2. Import the workflow into n8n

1. Open n8n.
2. Create a new workflow.
3. Use `Import from File`.
4. Select `n8n/tiki-talk-google-sheets-capture.json`.

## 3. Connect credentials

After import:

1. Open `Add Newsletter Row to Google Sheets` and select your real Google Sheets credential.
2. Open `Add Club Row to Google Sheets` and select your real Google Sheets credential.
3. Open `Send Newsletter Email Notification` and select your real Gmail credential.
4. Open `Send Club Email Notification` and select your real Gmail credential.

## 4. Replace placeholders

In both Google Sheets nodes, replace:

```text
REPLACE_WITH_TIKI_TALK_SPREADSHEET_ID
```

with the spreadsheet ID from:

```text
https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
```

In both Gmail nodes, replace:

```text
REPLACE_WITH_NOTIFICATION_EMAIL
```

with the email address that should receive lead notifications.

## 5. Copy the webhook URLs into the Vite app

Create a local `.env` file from `.env.example`.

```powershell
Copy-Item .env.example .env
```

Production URLs for the hosted n8n instance:

```env
VITE_N8N_NEWSLETTER_WEBHOOK_URL=https://n8n.bitesites.org/webhook/tiki-talk/newsletter
VITE_N8N_CLUB_WEBHOOK_URL=https://n8n.bitesites.org/webhook/tiki-talk/club
```

For local testing, n8n must be running on port `5678`:

```bash
npm run n8n
```

If you are testing from the n8n editor before activating the workflow, click `Listen for test event` on each webhook node and use:

```env
VITE_N8N_NEWSLETTER_WEBHOOK_URL=http://localhost:5678/webhook-test/tiki-talk/newsletter
VITE_N8N_CLUB_WEBHOOK_URL=http://localhost:5678/webhook-test/tiki-talk/club
```

With a local active workflow, use:

```env
VITE_N8N_NEWSLETTER_WEBHOOK_URL=http://localhost:5678/webhook/tiki-talk/newsletter
VITE_N8N_CLUB_WEBHOOK_URL=http://localhost:5678/webhook/tiki-talk/club
```

## 6. Activate and test

1. Save and activate the workflow in n8n.
2. Start the Vite app.
3. Submit the newsletter form.
4. Submit the club form.
5. Confirm that each lead lands in the correct spreadsheet tab and that the notification email is sent.

## Payload sent by the website

The frontend posts these fields to n8n:

- `email`
- `Email`
- `formType`
- `source`
- `sourceUrl`
- `pageUrl`
- `submittedAt`
- `dateSent`
- `Date Sent`
