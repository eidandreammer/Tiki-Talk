import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { leadCaptureApiPlugin } from './server/devLeadCapture.js'
import { getSoccerTickerResponse } from './server/soccerTicker.js'

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

        const result = await getSoccerTickerResponse({
          env: {
            ...process.env,
            ...env,
          },
        })

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
