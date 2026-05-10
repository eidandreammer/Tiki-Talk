import { useEffect, useRef, useState } from 'react'
import heroPoster768Avif from '../assets/tiki-hero-poster-768.avif'
import heroPoster1280Avif from '../assets/tiki-hero-poster-1280.avif'
import heroPoster1920Avif from '../assets/tiki-hero-poster-1920.avif'
import heroPoster1280Jpg from '../assets/tiki-hero-poster-1280.jpg'
import heroPoster1920Jpg from '../assets/tiki-hero-poster-1920.jpg'
import heroVideo540 from '../assets/tiki-hero-scroll-540.mp4'
import heroVideo720 from '../assets/tiki-hero-scroll-720.mp4'

const HERO_VIDEO_DURATION_SECONDS = 8
const SEEK_STEP_SECONDS = 1 / 30

function TacticalHero() {
  const heroRef = useRef(null)
  const videoRef = useRef(null)
  const imgRef = useRef(null)
  const titleRefs = useRef([])
  const [isPosterLoaded, setIsPosterLoaded] = useState(false)
  const [isVideoReady, setIsVideoReady] = useState(false)

  useEffect(() => {
    if (imgRef.current && imgRef.current.complete) {
      setIsPosterLoaded(true)
    }
  }, [])
  const [videoSource, setVideoSource] = useState('')

  useEffect(() => {
    if (!isPosterLoaded) {
      return undefined
    }

    let idleCallbackId
    let timeoutId
    let isCancelled = false

    const loadHeroVideo = () => {
      if (isCancelled) {
        return
      }

      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const shouldSaveData = Boolean(navigator.connection?.saveData)

      if (prefersReducedMotion || shouldSaveData) {
        return
      }

      const shouldUseSmallVideo = window.matchMedia('(max-width: 760px)').matches
      setVideoSource(shouldUseSmallVideo ? heroVideo540 : heroVideo720)
    }

    if ('requestIdleCallback' in window) {
      idleCallbackId = window.requestIdleCallback(loadHeroVideo, { timeout: 1200 })
    } else {
      timeoutId = window.setTimeout(loadHeroVideo, 350)
    }

    return () => {
      isCancelled = true

      if (idleCallbackId) {
        window.cancelIdleCallback(idleCallbackId)
      }

      if (timeoutId) {
        window.clearTimeout(timeoutId)
      }
    }
  }, [isPosterLoaded])

  useEffect(() => {
    let animationFrameId = 0
    let latestScrollY = window.scrollY

    const updateHeroFromScroll = () => {
      animationFrameId = 0
      const hero = heroRef.current
      const video = videoRef.current
      const viewportHeight = window.innerHeight || 1
      const heroHeight = hero?.offsetHeight || viewportHeight
      const maxScroll = Math.max(heroHeight, viewportHeight * 1.5)
      const scrollProgress = Math.min(Math.max(latestScrollY / maxScroll, 0), 1)
      const titleProgress = Math.min(latestScrollY / (viewportHeight * 0.8), 1)

      if (isVideoReady && video && Number.isFinite(video.duration) && video.duration > 0) {
        const targetDuration = Math.min(HERO_VIDEO_DURATION_SECONDS, video.duration)
        const targetTime = scrollProgress * targetDuration
        const shouldSeek = Math.abs(video.currentTime - targetTime) >= SEEK_STEP_SECONDS

        if (shouldSeek) {
          video.currentTime = targetTime
        }
      }

      titleRefs.current.forEach((el, index) => {
        if (!el) return

        const directionX = index % 2 === 0 ? -1 : 1
        const directionY = index < 2 ? -1 : 1
        const moveX = titleProgress * 100 * directionX
        const moveY = titleProgress * 50 * directionY
        const scale = 1 + titleProgress * 0.5
        const opacity = 1 - titleProgress * 1.2

        el.style.transform = `translate(${moveX}px, ${moveY}px) scale(${scale})`
        el.style.opacity = Math.max(opacity, 0).toString()
      })
    }

    const requestScrollUpdate = () => {
      if (animationFrameId) {
        return
      }

      animationFrameId = requestAnimationFrame(updateHeroFromScroll)
    }

    const handleScroll = () => {
      latestScrollY = window.scrollY
      requestScrollUpdate()
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll)

    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
      if (animationFrameId) cancelAnimationFrame(animationFrameId)
    }
  }, [isVideoReady])

  const addToRefs = (el) => {
    if (el && !titleRefs.current.includes(el)) {
      titleRefs.current.push(el)
    }
  }

  return (
    <section
      ref={heroRef}
      className="hero"
      id="home"
    >
      <div className="hero__media" aria-hidden="true">
        <picture className="hero__media-picture">
          <source
            type="image/avif"
            srcSet={`${heroPoster768Avif} 768w, ${heroPoster1280Avif} 1280w, ${heroPoster1920Avif} 1920w`}
            sizes="100vw"
          />
          <img
            ref={imgRef}
            className="hero__media-image"
            src={heroPoster1280Jpg}
            srcSet={`${heroPoster1280Jpg} 1280w, ${heroPoster1920Jpg} 1920w`}
            sizes="100vw"
            width="1280"
            height="720"
            alt=""
            fetchPriority="high"
            loading="eager"
            decoding="sync"
            onLoad={() => setIsPosterLoaded(true)}
          />
        </picture>
        {videoSource ? (
          <video
            ref={videoRef}
            className={`hero__media-video${isVideoReady ? ' hero__media-video--ready' : ''}`}
            src={videoSource}
            muted
            playsInline
            autoPlay
            preload="auto"
            onLoadedData={(e) => {
              e.target.pause()
              setIsVideoReady(true)
            }}
          />
        ) : null}
      </div>

      <div className="site-frame hero__layout">
        <div className="hero__content">
          <div className="hero__copy">
            <h1>
              <span ref={addToRefs} className="hero__title-word hero__title-word--tiki-first">Tiki</span>
              <span ref={addToRefs} className="hero__title-dash hero__title-dash--first">-</span>
              <span ref={addToRefs} className="hero__title-word hero__title-word--taka">Taka</span>
              <br />
              <span ref={addToRefs} className="hero__title-word hero__title-word--tiki-second">Tiki</span>
              <span ref={addToRefs} className="hero__title-dash hero__title-dash--second">-</span>
              <span ref={addToRefs} className="hero__title-word hero__title-word--talk">Talk</span>
              <br />
              <span style={{ color: '#b11f1f' }}>Go beyond the pitch.</span>
            </h1>
            <p className="hero__lede">
              Our podcast covers football matches around the world, reviews tactical breakdowns, and captures the cultures that surround the game.

            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default TacticalHero
