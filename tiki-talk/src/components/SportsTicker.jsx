import { useEffect, useLayoutEffect, useRef, useState } from 'react'

const API_HOST = 'https://v3.Fútbol.api-sports.io'
const API_KEY = import.meta.env.VITE_APISPORTS_KEY ?? 'a95a84eeeac7bcec6f257d75f2b22239'
const CACHE_TTL_MS = 30 * 60 * 1000
const CACHE_NAMESPACE = 'selected-leagues-v1'
const TICKER_TIME_ZONE = 'America/New_York'
const TICKER_PIXELS_PER_SECOND = 94.3
const MIN_TICKER_DURATION_SECONDS = 17.4
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
  480, // Olympic Fútbol Tournament
])

function getTodayKey() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TICKER_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date())

  const dateParts = Object.fromEntries(parts.map((part) => [part.type, part.value]))

  return `${dateParts.year}-${dateParts.month}-${dateParts.day}`
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
  const finishedStatuses = new Set(['FT', 'AET', 'PEN'])
  const liveStatuses = new Set(['1H', 'HT', '2H', 'ET', 'BT', 'P'])

  if (finishedStatuses.has(status)) {
    return `${league}: ${home} ${score} ${away}`
  }

  if (liveStatuses.has(status)) {
    const elapsed = match.fixture.status.elapsed ? `${match.fixture.status.elapsed}'` : 'Live'

    return `${league}: ${home} ${score} ${away} | ${elapsed}`
  }

  if (status === 'NS' || status === 'TBD') {
    return `${league}: ${formatKickoff(match.fixture.date)} | ${home} vs ${away}`
  }

  return `${league}: ${home} ${score} ${away} | ${match.fixture.status.long}`
}

function normalizeFixture(match) {
  return {
    fixture: {
      date: match.fixture.date,
      status: {
        short: match.fixture.status.short,
        long: match.fixture.status.long,
        elapsed: match.fixture.status.elapsed,
      },
    },
    league: {
      id: match.league.id,
      name: match.league.name,
    },
    teams: {
      home: {
        name: match.teams.home.name,
      },
      away: {
        name: match.teams.away.name,
      },
    },
    goals: {
      home: match.goals.home,
      away: match.goals.away,
    },
  }
}

function readCachedFixtures(cacheKey) {
  try {
    const cachedValue = window.localStorage.getItem(cacheKey)

    if (!cachedValue) {
      return null
    }

    const cachedData = JSON.parse(cachedValue)

    if (Date.now() - cachedData.savedAt > CACHE_TTL_MS) {
      return null
    }

    return cachedData.fixtures
  } catch {
    return null
  }
}

function writeCachedFixtures(cacheKey, fixtures) {
  try {
    window.localStorage.setItem(
      cacheKey,
      JSON.stringify({
        savedAt: Date.now(),
        fixtures,
      }),
    )
  } catch {
    // The ticker can still work if browser storage is unavailable.
  }
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

function SportsTicker() {
  const trackRef = useRef(null)
  const [tickerItems, setTickerItems] = useState([])
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    const controller = new AbortController()
    const dateKey = getTodayKey()
    const cacheKey = `tiki-talk-fixtures-${CACHE_NAMESPACE}-${dateKey}`

    async function loadFixtures() {
      const cachedFixtures = readCachedFixtures(cacheKey)

      if (cachedFixtures) {
        setTickerItems(cachedFixtures.map(formatFixture))
        setStatus(cachedFixtures.length ? 'ready' : 'empty')
        return
      }

      try {
        const params = new URLSearchParams({
          date: dateKey,
          timezone: TICKER_TIME_ZONE,
        })
        const response = await fetch(`${API_HOST}/fixtures?${params.toString()}`, {
          method: 'GET',
          headers: {
            'x-apisports-key': API_KEY,
          },
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error(`Fixtures request failed with ${response.status}`)
        }

        const data = await response.json()

        if (hasApiErrors(data.errors)) {
          throw new Error('Fixtures request returned API errors')
        }

        const fixtures = Array.isArray(data.response)
          ? data.response.filter(isTickerLeague).map(normalizeFixture)
          : []

        writeCachedFixtures(cacheKey, fixtures)
        setTickerItems(fixtures.map(formatFixture))
        setStatus(fixtures.length ? 'ready' : 'empty')
      } catch (error) {
        if (error.name === 'AbortError') {
          return
        }

        setStatus('error')
      }
    }

    loadFixtures()

    return () => controller.abort()
  }, [])

  useLayoutEffect(() => {
    const track = trackRef.current

    if (!track) {
      return undefined
    }

    const updateTickerDuration = () => {
      const scrollDistance = track.scrollWidth / 2
      // Speed varies slightly based on screen width (smaller width = slower)
      const variableSpeed = TICKER_PIXELS_PER_SECOND + (window.innerWidth * 0.005)
      const duration = Math.max(
        MIN_TICKER_DURATION_SECONDS,
        scrollDistance / variableSpeed,
      )

      track.style.setProperty('--ticker-duration', `${duration}s`)
    }

    updateTickerDuration()

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', updateTickerDuration)

      return () => window.removeEventListener('resize', updateTickerDuration)
    }

    const resizeObserver = new ResizeObserver(updateTickerDuration)
    resizeObserver.observe(track)

    return () => resizeObserver.disconnect()
  }, [tickerItems, status])

  const fallbackText = {
    loading: "Loading today's Fútbol matchups...",
    empty: 'No selected Fútbol matchups found for today.',
    error: 'Match ticker unavailable right now.',
  }[status]
  const displayItems = tickerItems.length ? tickerItems : [fallbackText]
  const repeatedItems = [...displayItems, ...displayItems]

  return (
    <aside className="sports-ticker" aria-label="Today Fútbol matchups">
      <div className="sports-ticker__label">Today</div>
      <div className="sports-ticker__viewport">
        <div className="sports-ticker__track" ref={trackRef}>
          {repeatedItems.map((item, index) => (
            <span className="sports-ticker__item" key={`${item}-${index}`}>
              {item}
            </span>
          ))}
        </div>
      </div>
    </aside>
  )
}

export default SportsTicker
