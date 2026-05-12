const API_HOST = 'https://v3.football.api-sports.io'
const TICKER_TIME_ZONE = 'America/New_York'
const LIVE_CACHE_TTL_SECONDS = 90
const UPCOMING_CACHE_TTL_SECONDS = 30 * 60
const MIN_SETTLED_CACHE_TTL_SECONDS = 60 * 60
const MAX_SETTLED_CACHE_TTL_SECONDS = 12 * 60 * 60
const STALE_WHILE_REVALIDATE_SECONDS = 60 * 60
const MEMORY_STALE_TTL_SECONDS = 12 * 60 * 60
const TICKER_LEAGUE_IDS = new Set([
  39, // Premier League
  140, // La Liga
  78, // Bundesliga
  135, // Serie A
  61, // Ligue 1
  128, // Argentine Primera Division
  71, // Campeonato Brasileiro Serie A
  2, // UEFA Champions League
  3, // UEFA Europa League
  848, // UEFA Conference League
  13, // CONMEBOL Libertadores
  11, // CONMEBOL Sudamericana
  17, // AFC Champions League
  1, // FIFA World Cup
  9, // Copa America
  4, // European Championship
  480, // Olympic Futbol Tournament
])
const LIVE_STATUSES = new Set(['1H', 'HT', '2H', 'ET', 'BT', 'P'])
const UPCOMING_STATUSES = new Set(['NS', 'TBD'])
const FINISHED_STATUSES = new Set(['FT', 'AET', 'PEN'])
const memoryCache = new Map()

function getApiKey(env) {
  return env.APISPORTS_KEY ?? env.API_SPORTS_KEY ?? ''
}

function getTodayKey(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TICKER_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now)

  const dateParts = Object.fromEntries(parts.map((part) => [part.type, part.value]))

  return `${dateParts.year}-${dateParts.month}-${dateParts.day}`
}

function getSecondsUntilTomorrow(now = new Date()) {
  const dateKey = getTodayKey(now)
  const nextNoonUtc = new Date(`${dateKey}T12:00:00.000Z`)
  nextNoonUtc.setUTCDate(nextNoonUtc.getUTCDate() + 1)

  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TICKER_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(nextNoonUtc)
  const dateParts = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  const timezoneOffsetMs =
    Date.UTC(
      Number(dateParts.year),
      Number(dateParts.month) - 1,
      Number(dateParts.day),
      Number(dateParts.hour),
      Number(dateParts.minute),
      Number(dateParts.second),
    ) - nextNoonUtc.getTime()
  const tomorrowStart = new Date(`${dateKey}T00:00:00.000Z`)
  tomorrowStart.setUTCDate(tomorrowStart.getUTCDate() + 1)

  return Math.max(
    1,
    Math.floor((tomorrowStart.getTime() - timezoneOffsetMs - now.getTime()) / 1000),
  )
}

function formatKickoff(isoDate) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: TICKER_TIME_ZONE,
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(isoDate))
}

function formatFixture(match) {
  const status = match.fixture.status.short
  const home = match.teams.home.name
  const away = match.teams.away.name
  const homeGoals = match.goals.home
  const awayGoals = match.goals.away
  const league = match.league.name
  const hasScore = homeGoals !== null && awayGoals !== null
  const score = hasScore ? `${homeGoals}-${awayGoals}` : 'vs'

  if (FINISHED_STATUSES.has(status)) {
    return `${league}: ${home} ${score} ${away}`
  }

  if (LIVE_STATUSES.has(status)) {
    const elapsed = match.fixture.status.elapsed ? `${match.fixture.status.elapsed}'` : 'Live'

    return `${league}: ${home} ${score} ${away} | ${elapsed}`
  }

  if (UPCOMING_STATUSES.has(status)) {
    return `${league}: ${formatKickoff(match.fixture.date)} | ${home} vs ${away}`
  }

  return `${league}: ${home} ${score} ${away} | ${match.fixture.status.long}`
}

function hasApiErrors(errors) {
  if (!errors) {
    return false
  }

  if (Array.isArray(errors)) {
    return errors.length > 0
  }

  if (typeof errors === 'object') {
    return Object.keys(errors).length > 0
  }

  return Boolean(errors)
}

function isTickerLeague(match) {
  return TICKER_LEAGUE_IDS.has(match.league?.id)
}

function getCachePolicy(fixtures, now = new Date()) {
  const hasLiveMatch = fixtures.some((match) => LIVE_STATUSES.has(match.fixture.status.short))
  const hasUpcomingMatch = fixtures.some((match) =>
    UPCOMING_STATUSES.has(match.fixture.status.short),
  )

  if (hasLiveMatch) {
    return {
      category: 'live',
      ttlSeconds: LIVE_CACHE_TTL_SECONDS,
      clientTtlMs: 60 * 1000,
    }
  }

  if (hasUpcomingMatch) {
    return {
      category: 'upcoming',
      ttlSeconds: UPCOMING_CACHE_TTL_SECONDS,
      clientTtlMs: UPCOMING_CACHE_TTL_SECONDS * 1000,
    }
  }

  const ttlSeconds = Math.min(
    MAX_SETTLED_CACHE_TTL_SECONDS,
    Math.max(MIN_SETTLED_CACHE_TTL_SECONDS, getSecondsUntilTomorrow(now)),
  )

  return {
    category: fixtures.length ? 'settled' : 'empty',
    ttlSeconds,
    clientTtlMs: ttlSeconds * 1000,
  }
}

function createHeaders(ttlSeconds, staleWhileRevalidateSeconds = STALE_WHILE_REVALIDATE_SECONDS) {
  return {
    'Cache-Control': `public, s-maxage=${ttlSeconds}, stale-while-revalidate=${staleWhileRevalidateSeconds}`,
  }
}

function readMemoryCache(cacheKey, nowMs) {
  const cached = memoryCache.get(cacheKey)

  if (!cached || cached.expiresAt <= nowMs) {
    return null
  }

  return cached
}

function writeMemoryCache(cacheKey, result, nowMs, ttlMs) {
  memoryCache.set(cacheKey, {
    ...result,
    expiresAt: nowMs + ttlMs,
    staleUntil: nowMs + MEMORY_STALE_TTL_SECONDS * 1000,
  })
}

function readStaleMemoryCache(cacheKey, nowMs) {
  const cached = memoryCache.get(cacheKey)

  if (!cached || cached.staleUntil <= nowMs) {
    return null
  }

  return {
    ...cached,
    body: {
      ...cached.body,
      stale: true,
    },
  }
}

async function fetchFixtures({ apiKey, dateKey, fetchImpl, signal }) {
  const params = new URLSearchParams({
    date: dateKey,
    timezone: TICKER_TIME_ZONE,
  })
  const response = await fetchImpl(`${API_HOST}/fixtures?${params.toString()}`, {
    method: 'GET',
    headers: {
      'x-apisports-key': apiKey,
    },
    signal,
  })

  if (!response.ok) {
    throw new Error(`Fixtures request failed with ${response.status}`)
  }

  const data = await response.json()

  if (hasApiErrors(data.errors)) {
    throw new Error('Fixtures request returned API errors')
  }

  return Array.isArray(data.response) ? data.response.filter(isTickerLeague) : []
}

export async function getSoccerTickerResponse({
  env = process.env,
  fetchImpl = fetch,
  now = new Date(),
  signal,
} = {}) {
  const apiKey = getApiKey(env)
  const dateKey = getTodayKey(now)
  const cacheKey = `soccer-ticker:${dateKey}`
  const nowMs = now.getTime()
  const cached = readMemoryCache(cacheKey, nowMs)

  if (cached) {
    return {
      ...cached,
      body: {
        ...cached.body,
        source: 'memory',
      },
    }
  }

  if (!apiKey.trim()) {
    return {
      status: 500,
      headers: {
        'Cache-Control': 'no-store',
      },
      body: {
        date: dateKey,
        items: [],
        status: 'error',
        cache: {
          category: 'missing-key',
          ttlMs: 0,
        },
      },
    }
  }

  try {
    const fixtures = await fetchFixtures({ apiKey, dateKey, fetchImpl, signal })
    const cachePolicy = getCachePolicy(fixtures, now)
    const result = {
      status: 200,
      headers: createHeaders(cachePolicy.ttlSeconds),
      body: {
        date: dateKey,
        items: fixtures.map(formatFixture),
        status: fixtures.length ? 'ready' : 'empty',
        cache: {
          category: cachePolicy.category,
          ttlMs: cachePolicy.clientTtlMs,
        },
        source: 'api-sports',
      },
    }

    writeMemoryCache(cacheKey, result, nowMs, cachePolicy.ttlSeconds * 1000)

    return result
  } catch {
    const staleCached = readStaleMemoryCache(cacheKey, nowMs)

    if (staleCached) {
      return {
        ...staleCached,
        headers: createHeaders(60, 5 * 60),
      }
    }

    return {
      status: 502,
      headers: {
        'Cache-Control': 'no-store',
      },
      body: {
        date: dateKey,
        items: [],
        status: 'error',
        cache: {
          category: 'error',
          ttlMs: 0,
        },
      },
    }
  }
}
