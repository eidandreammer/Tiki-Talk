import { mkdir, rm, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

import { getSoccerTickerResponse, getTodayKey } from '../server/soccerTicker.js'

const tickerRouteFile = new URL('../dist/api/soccer-ticker', import.meta.url)
const tickerDebugFile = new URL('../dist/api/soccer-ticker.json', import.meta.url)
const DEPLOYED_TICKER_URL =
  process.env.SOCCER_TICKER_REUSE_URL ?? 'https://tikitalk.us/api/soccer-ticker'
const DEFAULT_MIN_REFRESH_SECONDS = 55 * 60
const NON_REUSABLE_SOURCES = new Set(['dev-static-fallback', 'push-build-fallback'])

async function writeJsonFile(fileUrl, data) {
  await mkdir(new URL('.', fileUrl), { recursive: true })
  await writeFile(fileUrl, `${JSON.stringify(data, null, 2)}\n`, 'utf8')
}

function getMinRefreshSeconds() {
  const configuredSeconds = Number(process.env.SOCCER_TICKER_MIN_REFRESH_SECONDS)

  if (Number.isFinite(configuredSeconds)) {
    return Math.max(0, configuredSeconds)
  }

  return DEFAULT_MIN_REFRESH_SECONDS
}

function isReusableTicker(tickerData, now = new Date()) {
  if (
    !tickerData ||
    !Array.isArray(tickerData.items) ||
    typeof tickerData.status !== 'string' ||
    tickerData.status === 'error' ||
    NON_REUSABLE_SOURCES.has(tickerData.source) ||
    NON_REUSABLE_SOURCES.has(tickerData.cache?.category) ||
    typeof tickerData.generatedAt !== 'string' ||
    tickerData.date !== getTodayKey(now)
  ) {
    return false
  }

  const generatedAtMs = Date.parse(tickerData.generatedAt)

  if (!Number.isFinite(generatedAtMs)) {
    return false
  }

  const ageSeconds = (now.getTime() - generatedAtMs) / 1000

  return ageSeconds >= 0 && ageSeconds < getMinRefreshSeconds()
}

async function readReusableDeployedTicker(now = new Date()) {
  try {
    const response = await fetch(DEPLOYED_TICKER_URL, {
      headers: {
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(15 * 1000),
    })

    if (!response.ok) {
      return null
    }

    const tickerData = await response.json()

    if (!isReusableTicker(tickerData, now)) {
      return null
    }

    return {
      ...tickerData,
      source: tickerData.source ?? 'deployed-static-cache',
    }
  } catch {
    return null
  }
}

async function main() {
  const now = new Date()
  const reusableTicker = await readReusableDeployedTicker(now)
  const result = reusableTicker ? null : await getSoccerTickerResponse({ now })

  if (result?.status >= 500) {
    throw new Error(`Soccer ticker API returned status ${result.status}.`)
  }

  const body = reusableTicker ?? {
    ...result.body,
    generatedAt: now.toISOString(),
    source: result.body.source ?? 'static-build',
  }

  await rm(tickerRouteFile, { recursive: true, force: true })
  await writeJsonFile(tickerRouteFile, body)
  await writeJsonFile(tickerDebugFile, body)

  const routePath = fileURLToPath(tickerRouteFile)
  const debugPath = fileURLToPath(tickerDebugFile)
  console.log(`Wrote static soccer ticker to ${routePath}`)
  console.log(`Wrote debug soccer ticker to ${debugPath}`)

  if (reusableTicker) {
    console.log(`Reused fresh deployed soccer ticker from ${DEPLOYED_TICKER_URL}`)
  }

}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
