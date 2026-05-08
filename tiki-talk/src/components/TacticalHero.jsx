import { useEffect, useRef, useState } from 'react'
import heroPosterSmall from '../assets/tiki-hero-poster-768.avif'
import heroPosterMedium from '../assets/tiki-hero-poster-1280.avif'
import heroPosterLarge from '../assets/tiki-hero-poster-1920.avif'
import heroPosterFallbackMedium from '../assets/tiki-hero-poster-1280.jpg'
import heroPosterFallbackLarge from '../assets/tiki-hero-poster-1920.jpg'
import heroVideoMobile from '../assets/tiki-hero-scroll-540.mp4'
import heroVideoDesktop from '../assets/tiki-hero-scroll-720.mp4'

const HERO_POSTER_AVIF_SRCSET = `${heroPosterSmall} 768w, ${heroPosterMedium} 1280w, ${heroPosterLarge} 1920w`
const HERO_POSTER_FALLBACK_SRCSET = `${heroPosterFallbackMedium} 1280w, ${heroPosterFallbackLarge} 1920w`
const HERO_POSTER_SIZES = '100vw'
const MAX_VIDEO_TIME = 8

function TacticalHero() {
  const videoRef = useRef(null)
  const titleRefs = useRef([])
  const lastVideoTimeRef = useRef(0)
  const [isVideoVisible, setIsVideoVisible] = useState(false)

  useEffect(() => {
    let animationFrameId
    let loadTimerId
    let maxScroll = window.innerHeight * 1.5
    let textScrollDistance = window.innerHeight * 0.8
    let isTicking = false
    const shouldReduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const shouldSaveData = Boolean(navigator.connection?.saveData)

    const loadVideo = () => {
      const video = videoRef.current

      if (!video || video.dataset.loaded || shouldReduceMotion || shouldSaveData) {
        return
      }

      const isCompactViewport = window.matchMedia('(max-width: 760px)').matches
      video.src = isCompactViewport ? heroVideoMobile : heroVideoDesktop
      video.dataset.loaded = 'true'
      video.load()
    }

    const updateMeasurements = () => {
      maxScroll = window.innerHeight * 1.5
      textScrollDistance = window.innerHeight * 0.8
    }

    const scheduleDeferredVideoLoad = () => {
      if (!shouldReduceMotion && !shouldSaveData) {
        loadTimerId = window.setTimeout(loadVideo, 2500)
      }
    }

    const handleScroll = () => {
      if (window.scrollY > 8) {
        loadVideo()
      }

      if (isTicking) {
        return
      }

      isTicking = true
      animationFrameId = requestAnimationFrame(() => {
        isTicking = false
        const scrollY = window.scrollY

        if (!shouldReduceMotion && videoRef.current && videoRef.current.readyState >= 2) {
          const scrollProgress = Math.min(scrollY / maxScroll, 1)
          const duration = Number.isFinite(videoRef.current.duration)
            ? videoRef.current.duration
            : MAX_VIDEO_TIME
          const targetTime = Math.min(scrollProgress * MAX_VIDEO_TIME, duration)

          if (
            Number.isFinite(targetTime) &&
            Math.abs(targetTime - lastVideoTimeRef.current) > 0.04
          ) {
            videoRef.current.currentTime = targetTime
            lastVideoTimeRef.current = targetTime
          }
        }

        titleRefs.current.forEach((el, index) => {
          if (!el) return

          const progress = Math.min(scrollY / textScrollDistance, 1)
          const directionX = index % 2 === 0 ? -1 : 1
          const directionY = index < 2 ? -1 : 1
          const moveX = progress * 100 * directionX
          const moveY = progress * 50 * directionY
          const scale = 1 + progress * 0.5
          const opacity = 1 - progress * 1.2

          el.style.transform = `translate(${moveX}px, ${moveY}px) scale(${scale})`
          el.style.opacity = Math.max(opacity, 0).toString()
        })
      })
    }

    if (document.readyState === 'complete') {
      scheduleDeferredVideoLoad()
    } else {
      window.addEventListener('load', scheduleDeferredVideoLoad, { once: true })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', updateMeasurements, { passive: true })

    handleScroll()

    return () => {
      window.removeEventListener('load', scheduleDeferredVideoLoad)
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', updateMeasurements)
      if (loadTimerId) window.clearTimeout(loadTimerId)
      if (animationFrameId) cancelAnimationFrame(animationFrameId)
    }
  }, [])

  const addToRefs = (el) => {
    if (el && !titleRefs.current.includes(el)) {
      titleRefs.current.push(el)
    }
  }

  return (
    <section className="hero" id="home">
      <div className="hero__media" aria-hidden="true">
        <picture className="hero__media-picture">
          <source
            type="image/avif"
            srcSet={HERO_POSTER_AVIF_SRCSET}
            sizes={HERO_POSTER_SIZES}
          />
          <img
            className="hero__media-image"
            src={heroPosterFallbackLarge}
            srcSet={HERO_POSTER_FALLBACK_SRCSET}
            sizes={HERO_POSTER_SIZES}
            alt=""
            width="1920"
            height="1072"
            fetchPriority="high"
            decoding="async"
          />
        </picture>
        <video
          ref={videoRef}
          className={`hero__media-video${isVideoVisible ? ' hero__media-video--ready' : ''}`}
          muted
          playsInline
          preload="none"
          onLoadedData={() => setIsVideoVisible(true)}
        />
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
              Fútbol debates, tactical insights, and the cultures that surround the game.

            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default TacticalHero
