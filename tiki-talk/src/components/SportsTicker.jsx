import { useEffect, useLayoutEffect, useRef, useState } from 'react'

const SOCCER_TICKER_ENDPOINT =
  import.meta.env.VITE_SOCCER_TICKER_ENDPOINT ?? '/api/soccer-ticker'
const FALLBACK_CACHE_TTL_MS = 30 * 60 * 1000
const CACHE_NAMESPACE = 'selected-leagues-v3'
const TICKER_TIME_ZONE = 'America/New_York'
const TICKER_PIXELS_PER_SECOND = 94.3
const MIN_TICKER_DURATION_SECONDS = 17.4
const pendingTickerLoads = new Map()

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

function readCachedTicker(cacheKey, { allowExpired = false } = {}) {
  try {
    const cachedValue = window.localStorage.getItem(cacheKey)

    if (!cachedValue) {
      return null
    }

    const cachedData = JSON.parse(cachedValue)

    if (
      !Array.isArray(cachedData.items) ||
      typeof cachedData.status !== 'string' ||
      !Number.isFinite(cachedData.expiresAt)
    ) {
      return null
    }

    if (!allowExpired && Date.now() > cachedData.expiresAt) {
      return null
    }

    return cachedData
  } catch {
    return null
  }
}

function writeCachedTicker(cacheKey, tickerData) {
  const ttlMs = Number.isFinite(tickerData.cache?.ttlMs)
    ? tickerData.cache.ttlMs
    : FALLBACK_CACHE_TTL_MS

  try {
    window.localStorage.setItem(
      cacheKey,
      JSON.stringify({
        savedAt: Date.now(),
        expiresAt: Date.now() + Math.max(0, ttlMs),
        items: tickerData.items,
        status: tickerData.status,
      }),
    )
  } catch {
    // The ticker can still work if browser storage is unavailable.
  }
}

function applyTickerState(tickerData, setTickerItems, setStatus) {
  setTickerItems(tickerData.items)
  setStatus(tickerData.status === 'ready' ? 'ready' : 'empty')
}

function loadTickerFromEndpoint(cacheKey) {
  const pendingTickerLoad = pendingTickerLoads.get(cacheKey)

  if (pendingTickerLoad) {
    return pendingTickerLoad
  }

  const tickerLoad = fetch(SOCCER_TICKER_ENDPOINT, {
    method: 'GET',
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Ticker request failed with ${response.status}`)
      }

      return response.json()
    })
    .then((tickerData) => {
      if (!Array.isArray(tickerData.items) || tickerData.status === 'error') {
        throw new Error('Ticker request returned invalid data')
      }

      writeCachedTicker(cacheKey, tickerData)

      return tickerData
    })
    .finally(() => {
      pendingTickerLoads.delete(cacheKey)
    })

  pendingTickerLoads.set(cacheKey, tickerLoad)

  return tickerLoad
}

function SportsTicker() {
  const trackRef = useRef(null)
  const [tickerItems, setTickerItems] = useState([])
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    let isCurrent = true
    const dateKey = getTodayKey()
    const cacheKey = `tiki-talk-fixtures-${CACHE_NAMESPACE}-${dateKey}`

    async function loadFixtures() {
      const cachedTicker = readCachedTicker(cacheKey)

      if (cachedTicker) {
        if (isCurrent) {
          applyTickerState(cachedTicker, setTickerItems, setStatus)
        }
        return
      }

      try {
        const tickerData = await loadTickerFromEndpoint(cacheKey)

        if (isCurrent) {
          applyTickerState(tickerData, setTickerItems, setStatus)
        }
      } catch {
        if (!isCurrent) {
          return
        }

        const staleTicker = readCachedTicker(cacheKey, { allowExpired: true })

        if (staleTicker) {
          applyTickerState(staleTicker, setTickerItems, setStatus)
          return
        }

        setStatus('error')
      }
    }

    loadFixtures()

    return () => {
      isCurrent = false
    }
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
