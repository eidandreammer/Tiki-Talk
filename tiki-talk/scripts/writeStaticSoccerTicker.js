import { mkdir, rm, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

import { getSoccerTickerResponse } from '../server/soccerTicker.js'

const tickerRouteFile = new URL('../dist/api/soccer-ticker', import.meta.url)
const tickerDebugFile = new URL('../dist/api/soccer-ticker.json', import.meta.url)

async function writeJsonFile(fileUrl, data) {
  await mkdir(new URL('.', fileUrl), { recursive: true })
  await writeFile(fileUrl, `${JSON.stringify(data, null, 2)}\n`, 'utf8')
}

async function main() {
  const result = await getSoccerTickerResponse()
  const body = {
    ...result.body,
    generatedAt: new Date().toISOString(),
    source: result.body.source ?? 'static-build',
  }

  await rm(tickerRouteFile, { recursive: true, force: true })
  await writeJsonFile(tickerRouteFile, body)
  await writeJsonFile(tickerDebugFile, body)

  const routePath = fileURLToPath(tickerRouteFile)
  const debugPath = fileURLToPath(tickerDebugFile)
  console.log(`Wrote static soccer ticker to ${routePath}`)
  console.log(`Wrote debug soccer ticker to ${debugPath}`)

  if (result.status >= 500) {
    console.warn(`Warning: Soccer ticker API returned status ${result.status}.`)
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
