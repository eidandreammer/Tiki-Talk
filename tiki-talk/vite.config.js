import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { leadCaptureApiPlugin } from './server/devLeadCapture.js'
import { getSoccerTickerResponse, getTodayKey } from './server/soccerTicker.js'

const DEPLOYED_TICKER_URL = 'https://tikitalk.us/api/soccer-ticker'

function createJsonResult(status, body, cacheControl = 'no-store') {
  return {
    status,
    headers: {
      'Cache-Control': cacheControl,
    },
    body,
  }
}

async function getDeployedSoccerTickerResponse() {
  try {
    const deployedResponse = await fetch(DEPLOYED_TICKER_URL, {
      headers: {
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(10 * 1000),
    })

    if (!deployedResponse.ok) {
      throw new Error(`Deployed ticker request failed with ${deployedResponse.status}`)
    }

    const tickerData = await deployedResponse.json()

    if (!Array.isArray(tickerData.items) || typeof tickerData.status !== 'string') {
      throw new Error('Deployed ticker returned invalid data')
    }

    return createJsonResult(200, {
      ...tickerData,
      source: tickerData.source ?? 'deployed-static-dev',
    })
  } catch {
    return createJsonResult(200, {
      date: getTodayKey(),
      items: [],
      status: 'empty',
      cache: {
        category: 'dev-static-fallback',
        ttlMs: 30 * 60 * 1000,
      },
      source: 'dev-static-fallback',
    })
  }
}

function soccerTickerApiPlugin(env) {
  return {
    name: 'tiki-talk-soccer-ticker-api',
    configureServer(server) {
      server.middlewares.use('/api/soccer-ticker', async (request, response) => {
        if (request.method !== 'GET') {
          response.statusCode = 405
          response.setHeader('Allow', 'GET')
          response.end(JSON.stringify({ error: 'Method not allowed' }))
          return
        }

        const mergedEnv = {
          ...process.env,
          ...env,
        }
        const result =
          mergedEnv.APISPORTS_LIVE_DEV_REQUESTS === 'true'
            ? await getSoccerTickerResponse({ env: mergedEnv })
            : await getDeployedSoccerTickerResponse()

        response.statusCode = result.status
        response.setHeader('Content-Type', 'application/json')
        Object.entries(result.headers).forEach(([name, value]) => {
          response.setHeader(name, value)
        })
        response.end(JSON.stringify(result.body))
      })
    },
  }
}

function normalizeBasePath(basePath = '/') {
  if (basePath === '' || basePath === '/') {
    return '/'
  }

  const withLeadingSlash = basePath.startsWith('/') ? basePath : `/${basePath}`
  return withLeadingSlash.endsWith('/') ? withLeadingSlash : `${withLeadingSlash}/`
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), leadCaptureApiPlugin(), soccerTickerApiPlugin(env)],
    base: normalizeBasePath(env.VITE_BASE_PATH),
  }
})
