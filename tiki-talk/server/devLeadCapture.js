import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DEV_DATA_DIR = path.resolve(__dirname, '..', 'dev-data')
const DEV_DATA_FILE = path.join(DEV_DATA_DIR, 'lead-submissions.json')

const LEAD_CAPTURE_ROUTES = {
  '/api/lead-capture/newsletter': {
    type: 'newsletter',
    message: 'Newsletter signup saved locally for development.',
  },
  '/api/lead-capture/club': {
    type: 'club',
    message: 'Club request saved locally for development.',
  },
  '/api/lead-capture/tikitaka-submissions': {
    type: 'tikitaka-submissions',
    message: 'Success',
  },
}

async function parseRequestPayload(request) {
  const chunks = []

  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }

  const body = Buffer.concat(chunks)
  const contentType = request.headers['content-type'] ?? ''

  if (!body.length) {
    return {}
  }

  if (contentType.includes('application/json')) {
    return JSON.parse(body.toString('utf8'))
  }

  if (
    contentType.includes('multipart/form-data') ||
    contentType.includes('application/x-www-form-urlencoded')
  ) {
    const webRequest = new Request('http://localhost', {
      method: request.method,
      headers: request.headers,
      body,
    })
    const formData = await webRequest.formData()

    return Object.fromEntries(
      Array.from(formData.entries()).map(([key, value]) => [
        key,
        typeof value === 'string' ? value : value.name,
      ]),
    )
  }

  return {
    rawBody: body.toString('utf8'),
  }
}

async function readExistingSubmissions() {
  try {
    const raw = await fs.readFile(DEV_DATA_FILE, 'utf8')
    const parsed = JSON.parse(raw)

    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return []
    }

    throw error
  }
}

async function appendSubmission(entry) {
  await fs.mkdir(DEV_DATA_DIR, { recursive: true })

  const submissions = await readExistingSubmissions()

  submissions.push(entry)

  await fs.writeFile(DEV_DATA_FILE, `${JSON.stringify(submissions, null, 2)}\n`, 'utf8')
}

export function leadCaptureApiPlugin() {
  return {
    name: 'tiki-talk-dev-lead-capture',
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        const requestUrl = new URL(request.url ?? '/', 'http://localhost')
        const routeConfig = LEAD_CAPTURE_ROUTES[requestUrl.pathname]

        if (!routeConfig) {
          next()
          return
        }

        if (request.method !== 'POST') {
          response.statusCode = 405
          response.setHeader('Allow', 'POST')
          response.setHeader('Content-Type', 'application/json')
          response.end(JSON.stringify({ message: 'Method not allowed.' }))
          return
        }

        try {
          const payload = await parseRequestPayload(request)

          await appendSubmission({
            type: routeConfig.type,
            savedAt: new Date().toISOString(),
            payload,
            pathname: requestUrl.pathname,
          })

          response.statusCode = 200
          response.setHeader('Content-Type', 'application/json')
          response.end(
            JSON.stringify({
              ok: true,
              message: routeConfig.message,
            }),
          )
        } catch (error) {
          response.statusCode = 500
          response.setHeader('Content-Type', 'application/json')
          response.end(
            JSON.stringify({
              message:
                error instanceof Error
                  ? error.message
                  : 'Could not save the submission.',
            }),
          )
        }
      })
    },
  }
}
