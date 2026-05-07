import { useEffect, useRef } from 'react'
import heroBackground from '../assets/Tiki Taka Hero Section Background.png'

const VIDEO_URL = 'https://videos.pexels.com/video-files/3196220/3196220-uhd_2560_1440_25fps.mp4' // High-quality placeholder video

function TacticalHero() {
  const videoRef = useRef(null)
  const titleRefs = useRef([])

  useEffect(() => {
    let animationFrameId

    // We want the video to reach 8 seconds after scrolling a certain distance
    // Let's set the scroll distance to 1.5x the window height
    const maxScroll = window.innerHeight * 1.5
    const maxVideoTime = 8 // 8 seconds as requested

    const handleScroll = () => {
      // Use requestAnimationFrame to optimize DOM updates
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }

      animationFrameId = requestAnimationFrame(() => {
        const scrollY = window.scrollY

        // 1. Video Scrubbing
        if (videoRef.current && videoRef.current.readyState >= 2) {
          // Calculate progress from 0 to 1
          const scrollProgress = Math.min(scrollY / maxScroll, 1)

          // Map to 0 - 8 seconds
          const targetTime = scrollProgress * maxVideoTime

          // Ensure it's finite and within video bounds
          if (isFinite(targetTime) && targetTime <= videoRef.current.duration) {
            videoRef.current.currentTime = targetTime
          }
        }

        // 2. Text Animation (Multi-color logos)
        // Stagger the letters moving outwards or fading/scaling
        titleRefs.current.forEach((el, index) => {
          if (!el) return

          const progress = Math.min(scrollY / (window.innerHeight * 0.8), 1)

          // We can do a parallax + spread effect
          // Alternate direction based on index to spread them apart
          const directionX = index % 2 === 0 ? -1 : 1
          const directionY = index < 2 ? -1 : 1

          const moveX = progress * 100 * directionX
          const moveY = progress * 50 * directionY
          const scale = 1 + progress * 0.5
          const opacity = 1 - progress * 1.2 // Fade out slightly at the end

          el.style.transform = `translate(${moveX}px, ${moveY}px) scale(${scale})`
          el.style.opacity = Math.max(opacity, 0).toString()
        })
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    // Trigger once to set initial state
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (animationFrameId) cancelAnimationFrame(animationFrameId)
    }
  }, [])

  const addToRefs = (el) => {
    if (el && !titleRefs.current.includes(el)) {
      titleRefs.current.push(el)
    }
  }

  return (
    <section
      className="hero"
      id="home"
      style={{ '--hero-background': `url(${heroBackground})` }}
    >
      <div className="hero__media" aria-hidden="true">
        {/* Placeholder image acts as a poster/fallback */}
        <div className="hero__media-image" />
        {/* Video element for scrubbing */}
        <video
          ref={videoRef}
          className="hero__media-video"
          src={VIDEO_URL}
          muted
          playsInline
          preload="auto"
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
              <span style={{ color: '#DA292A' }}>Goes beyond the pitch.</span>
            </h1>
            <p className="hero__lede">
              Futbol debates, tactical insights, and the cultures that surround the game.

            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default TacticalHero
