const TIKITAKA_SUBMISSIONS_WEBHOOK_URL =
  import.meta.env.VITE_N8N_TIKITAKA_SUBMISSIONS_WEBHOOK_URL ||
  (import.meta.env.DEV ? '/api/lead-capture/tikitaka-submissions' : '')

export async function submitTikitakaSubmission({ userName, userEmail }) {
  const normalizedName = String(userName ?? '').trim()
  const normalizedEmail = String(userEmail ?? '').trim().toLowerCase()

  if (!normalizedName || !normalizedEmail) {
    throw new Error('userName and userEmail are required.')
  }

  if (!TIKITAKA_SUBMISSIONS_WEBHOOK_URL) {
    throw new Error(
      'Missing VITE_N8N_TIKITAKA_SUBMISSIONS_WEBHOOK_URL in your environment.',
    )
  }

  const response = await fetch(TIKITAKA_SUBMISSIONS_WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userName: normalizedName,
      userEmail: normalizedEmail,
    }),
  })

  const responseData = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(responseData?.message || 'Submission failed.')
  }

  return responseData
}
