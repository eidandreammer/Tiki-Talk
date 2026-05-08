import { getSoccerTickerResponse } from '../server/soccerTicker.js'

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET')
    response.status(405).json({ error: 'Method not allowed' })
    return
  }

  const result = await getSoccerTickerResponse()

  Object.entries(result.headers).forEach(([name, value]) => {
    response.setHeader(name, value)
  })

  response.status(result.status).json(result.body)
}
