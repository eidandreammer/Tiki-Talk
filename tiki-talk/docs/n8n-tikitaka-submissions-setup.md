# n8n `tikitaka-submissions` -> Google Sheets setup

The importable workflow file is [n8n/tikitaka-submissions-google-sheets.json](../n8n/tikitaka-submissions-google-sheets.json).

## What this workflow does

- Receives a `POST` request at `tikitaka-submissions`
- Appends one row to a Google Sheet
- Maps `userName` and `userEmail` from the incoming request body
- Returns a success response to the website through a `Respond to Webhook` node

## Important note about the sheet location

The Google Sheets node writes to a Google Sheet in your Google account, not to a standalone spreadsheet file on your Windows desktop.

If you have a shortcut or downloaded file on your desktop, that is not what n8n updates. The sheet you want must be the Google Sheet you can open in your browser.

## 1. Prepare the Google Sheet

1. Open the target Google Sheet in your browser.
2. Make sure the tab name matches the value you want in n8n.
3. If you want to use the workflow as-is, use the tab name `Sheet1`.
4. Put these exact headers in row `1`:

| userName | userEmail |
| --- | --- |

## 2. Find the Spreadsheet ID

When the sheet is open in your browser, the URL looks like this:

`https://docs.google.com/spreadsheets/d/1AbCdEfGhIjKlMnOpQrStUvWxYz1234567890/edit#gid=0`

The Spreadsheet ID is the part between `/d/` and `/edit`.

In the example above, the ID is:

`1AbCdEfGhIjKlMnOpQrStUvWxYz1234567890`

Paste that value into the Google Sheets node field named `Spreadsheet by ID`.

## 3. Import the workflow into n8n

1. Open n8n.
2. Create a new workflow.
3. Choose `Import from File`.
4. Select `n8n/tikitaka-submissions-google-sheets.json`.

## 4. Configure the Google Sheets node

After importing:

1. Open `Append Submission to Sheet`.
2. Select your Google Sheets OAuth2 credential.
3. Replace `REPLACE_WITH_SPREADSHEET_ID` with your real Spreadsheet ID.
4. Leave the sheet lookup mode as `By ID`.
5. Leave the sheet tab lookup mode as `By Name`.
6. Change `Sheet1` if your tab uses a different name.

## 5. Webhook behavior

The webhook node is already configured like this:

- Method: `POST`
- Path: `tikitaka-submissions`
- Response handling: `Respond to Webhook` node

The final node returns:

```json
{
  "message": "Success"
}
```

## 6. Frontend environment variable

Add this to your local `.env` file:

```env
VITE_N8N_TIKITAKA_SUBMISSIONS_WEBHOOK_URL=https://your-n8n-host/webhook/tikitaka-submissions
```

Use the `/webhook-test/` URL only while testing in the n8n editor before activation.

## 7. React fetch function

This repo now includes a helper at [src/lib/submitTikitakaSubmission.js](../src/lib/submitTikitakaSubmission.js).

Example usage:

```jsx
import { useState } from 'react'
import { submitTikitakaSubmission } from './lib/submitTikitakaSubmission'

function ExampleForm() {
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()

    try {
      const data = await submitTikitakaSubmission({ userName, userEmail })
      setMessage(data.message)
      setUserName('')
      setUserEmail('')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Submission failed.')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={userName}
        onChange={(event) => setUserName(event.target.value)}
        placeholder="Your name"
        required
      />
      <input
        type="email"
        value={userEmail}
        onChange={(event) => setUserEmail(event.target.value)}
        placeholder="you@example.com"
        required
      />
      <button type="submit">Send</button>
      {message ? <p>{message}</p> : null}
    </form>
  )
}
```

## 8. Expected payload

The frontend sends JSON in this shape:

```json
{
  "userName": "Ada Lovelace",
  "userEmail": "ada@example.com"
}
```
