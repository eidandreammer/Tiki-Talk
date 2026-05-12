import { useEffect, useRef, useState } from 'react'
import './App.css'
import SiteFooter from './components/SiteFooter'
import SportsTicker from './components/SportsTicker'
import TacticalHero from './components/TacticalHero'
import gianniHost360Avif from './assets/optimized/gianni-host-360.avif'
import gianniHost520Avif from './assets/optimized/gianni-host-520.avif'
import gianniHost720Avif from './assets/optimized/gianni-host-720.avif'
import gianniHost1080Avif from './assets/optimized/gianni-host-1080.avif'
import gianniHost360Png from './assets/optimized/gianni-host-360.png'
import gianniHost520Png from './assets/optimized/gianni-host-520.png'
import gianniHost720Png from './assets/optimized/gianni-host-720.png'
import vinnyBlueHost360Avif from './assets/optimized/vinny-blue-host-360.avif'
import vinnyBlueHost520Avif from './assets/optimized/vinny-blue-host-520.avif'
import vinnyBlueHost720Avif from './assets/optimized/vinny-blue-host-720.avif'
import vinnyBlueHost1080Avif from './assets/optimized/vinny-blue-host-1080.avif'
import vinnyBlueHost360Png from './assets/optimized/vinny-blue-host-360.png'
import vinnyBlueHost520Png from './assets/optimized/vinny-blue-host-520.png'
import vinnyBlueHost720Png from './assets/optimized/vinny-blue-host-720.png'
import vinnyNewsletter560Avif from './assets/optimized/vinny-newsletter-560.avif'
import vinnyNewsletter840Avif from './assets/optimized/vinny-newsletter-840.avif'
import vinnyNewsletter1120Avif from './assets/optimized/vinny-newsletter-1120.avif'
import vinnyNewsletter1535Avif from './assets/optimized/vinny-newsletter-1535.avif'
import vinnyNewsletter560Jpg from './assets/optimized/vinny-newsletter-560.jpg'
import vinnyNewsletter840Jpg from './assets/optimized/vinny-newsletter-840.jpg'
import vinnyNewsletter1120Jpg from './assets/optimized/vinny-newsletter-1120.jpg'
import clubGraphic from './assets/club-graphic.png'


function resolveWebhookUrl(envValue, localPath) {
  if (envValue) {
    return envValue
  }

  if (import.meta.env.DEV) {
    return localPath
  }

  return ''
}

const NEWSLETTER_BENEFITS = [
  'Notifications about new episodes, clips, and fresh content drops',
  'Podcast information, schedule updates, and key announcements',
  'Short notes that keep you close to the latest conversation',
]

const CLUB_PERKS = [
  'Exclusive bonus content built around the main show',
  'Early access to selected episodes and special releases',
  'Members-first updates when new extras go live',
]

const CLUB_HIGHLIGHTS = [
  {
    title: 'Exclusive',
    copy: 'Members-only breakdowns, bonus drops, and extra fútbol conversation.',
  },
  {
    title: 'Early Access',
    copy: 'Get in before public release when we open selected episodes and special content.',
  },
]

const HOST_IMAGE_SIZES =
  '(max-width: 560px) calc(100vw - 24px), (max-width: 1080px) calc((100vw - 38px) / 2), 400px'

const NEWSLETTER_IMAGE_SIZES =
  '(max-width: 560px) calc(100vw - 68px), (max-width: 1080px) 620px, 560px'

const HOSTS = [
  {
    name: 'Gianni',
    alt: 'Gianni wearing an Argentina jersey',
    lowAvifSrc: gianniHost360Avif,
    lowFallbackSrc: gianniHost360Png,
    avifSrcSet: `${gianniHost520Avif} 520w, ${gianniHost720Avif} 720w, ${gianniHost1080Avif} 1080w`,
    fallbackSrcSet: `${gianniHost360Png} 360w, ${gianniHost520Png} 520w, ${gianniHost720Png} 720w`,
    fallbackSrc: gianniHost520Png,
  },
  {
    name: 'Vinny',
    alt: 'Vinny seated in front of a blue Tiki-Taka Tiki-Talk graphic',
    lowAvifSrc: vinnyBlueHost360Avif,
    lowFallbackSrc: vinnyBlueHost360Png,
    avifSrcSet: `${vinnyBlueHost520Avif} 520w, ${vinnyBlueHost720Avif} 720w, ${vinnyBlueHost1080Avif} 1080w`,
    fallbackSrcSet: `${vinnyBlueHost360Png} 360w, ${vinnyBlueHost520Png} 520w, ${vinnyBlueHost720Png} 720w`,
    fallbackSrc: vinnyBlueHost520Png,
  },
]

function ProgressivePicture({
  alt,
  className,
  fetchPriority,
  height,
  highAvifSrcSet,
  highFallbackSrc,
  highFallbackSrcSet,
  loading = 'lazy',
  lowAvifSrc,
  lowFallbackSrc,
  pictureClassName,
  sizes,
  width,
}) {
  const pictureRef = useRef(null)
  const [shouldLoadHighQuality, setShouldLoadHighQuality] = useState(false)
  const [isHighQualityLoaded, setIsHighQualityLoaded] = useState(false)

  useEffect(() => {
    const picture = pictureRef.current

    if (!picture) {
      return undefined
    }

    let observer
    let idleCallbackId
    let timeoutId
    let isCancelled = false

    const loadHighQuality = () => {
      if (!isCancelled) {
        setShouldLoadHighQuality(true)
      }
    }

    const scheduleHighQualityLoad = () => {
      if ('requestIdleCallback' in window) {
        idleCallbackId = window.requestIdleCallback(loadHighQuality, { timeout: 1400 })
      } else {
        timeoutId = window.setTimeout(loadHighQuality, 450)
      }
    }

    if (loading === 'eager' || typeof IntersectionObserver === 'undefined') {
      scheduleHighQualityLoad()
    } else {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) {
            return
          }

          observer.disconnect()
          scheduleHighQualityLoad()
        },
        {
          rootMargin: '360px 0px',
        },
      )

      observer.observe(picture)
    }

    return () => {
      isCancelled = true
      observer?.disconnect()

      if (idleCallbackId) {
        window.cancelIdleCallback(idleCallbackId)
      }

      if (timeoutId) {
        window.clearTimeout(timeoutId)
      }
    }
  }, [loading])

  const handleHighQualityLoad = (event) => {
    const image = event.currentTarget
    const showHighQualityImage = () => setIsHighQualityLoaded(true)

    if (typeof image.decode === 'function') {
      image.decode().catch(() => undefined).finally(showHighQualityImage)
      return
    }

    showHighQualityImage()
  }

  return (
    <span
      ref={pictureRef}
      className={`progressive-picture ${pictureClassName}${
        isHighQualityLoaded ? ' progressive-picture--loaded' : ''
      }`}
    >
      <picture className="progressive-picture__base">
        <source type="image/avif" srcSet={lowAvifSrc} />
        <img
          className={className}
          src={lowFallbackSrc}
          width={width}
          height={height}
          alt={alt}
          loading={loading}
          decoding="async"
          fetchPriority={fetchPriority}
        />
      </picture>

      {shouldLoadHighQuality ? (
        <picture className="progressive-picture__full" aria-hidden="true">
          <source type="image/avif" srcSet={highAvifSrcSet} sizes={sizes} />
          <img
            className={className}
            src={highFallbackSrc}
            srcSet={highFallbackSrcSet}
            sizes={sizes}
            width={width}
            height={height}
            alt=""
            loading="lazy"
            decoding="async"
            fetchPriority="low"
            onLoad={handleHighQualityLoad}
          />
        </picture>
      ) : null}
    </span>
  )
}

const FORM_CONFIG = {
  newsletter: {
    webhookUrl: resolveWebhookUrl(
      import.meta.env.VITE_N8N_NEWSLETTER_WEBHOOK_URL,
      '/api/lead-capture/newsletter',
    ),
    source: 'newsletter',
    successMessage: 'Newsletter signup saved. You are on the list for the next drop.',
    missingConfigMessage: 'Newsletter webhook URL is missing. Add VITE_N8N_NEWSLETTER_WEBHOOK_URL.',
    networkErrorMessage:
      'Could not reach the newsletter webhook. Start n8n or set VITE_N8N_NEWSLETTER_WEBHOOK_URL.',
    fallbackErrorMessage: 'We could not save your newsletter signup. Try again in a moment.',
  },
  club: {
    webhookUrl: resolveWebhookUrl(
      import.meta.env.VITE_N8N_CLUB_WEBHOOK_URL,
      '/api/lead-capture/club',
    ),
    source: 'club',
    successMessage: 'Club request saved. We will use this email for members access updates.',
    missingConfigMessage: 'Club webhook URL is missing. Add VITE_N8N_CLUB_WEBHOOK_URL.',
    networkErrorMessage:
      'Could not reach the club webhook. Start n8n or set VITE_N8N_CLUB_WEBHOOK_URL.',
    fallbackErrorMessage: 'We could not save your club request. Try again in a moment.',
  },
}

const LOCAL_N8N_ORIGIN = 'http://localhost:5678'

function createLeadFormState() {
  return {
    email: '',
    status: 'idle',
    message: '',
  }
}

function isLocalN8nWebhook(webhookUrl) {
  return webhookUrl.startsWith(LOCAL_N8N_ORIGIN)
}

function getLeadSubmitErrorMessage(error, formConfig) {
  if (error instanceof TypeError && isLocalN8nWebhook(formConfig.webhookUrl)) {
    return 'Cannot reach local n8n at localhost:5678. Start n8n, then use /webhook-test while testing or activate the workflow and use /webhook.'
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return formConfig.fallbackErrorMessage
}

async function submitLead(webhookUrl, payload) {
  const body = new FormData()

  Object.entries(payload).forEach(([key, value]) => {
    body.set(key, value)
  })

  const response = await fetch(webhookUrl, {
    method: 'POST',
    body,
  })

  const responseData = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(responseData?.message || 'Request failed')
  }

  return responseData
}

function App() {
  const [isFooterVisible, setIsFooterVisible] = useState(false)
  const [leadForms, setLeadForms] = useState({
    newsletter: createLeadFormState(),
    club: createLeadFormState(),
  })

  useEffect(() => {
    const footerPanel = document.querySelector('.site-footer__panel')

    if (!footerPanel || typeof IntersectionObserver === 'undefined') {
      return undefined
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsFooterVisible(entry.isIntersecting)
      },
      {
        threshold: 0.05,
      },
    )

    observer.observe(footerPanel)

    return () => observer.disconnect()
  }, [])

  const updateLeadForm = (formKey, nextState) => {
    setLeadForms((currentState) => ({
      ...currentState,
      [formKey]: {
        ...currentState[formKey],
        ...nextState,
      },
    }))
  }

  const handleLeadInputChange = (formKey) => (event) => {
    updateLeadForm(formKey, {
      email: event.target.value,
      status: 'idle',
      message: '',
    })
  }

  const handleLeadSubmit = (formKey) => async (event) => {
    event.preventDefault()

    const formConfig = FORM_CONFIG[formKey]
    const email = leadForms[formKey].email.trim().toLowerCase()

    if (!email) {
      updateLeadForm(formKey, {
        status: 'error',
        message: 'Enter a valid email address before submitting.',
      })

      return
    }

    if (!formConfig.webhookUrl) {
      updateLeadForm(formKey, {
        status: 'error',
        message: formConfig.missingConfigMessage,
      })

      return
    }

    updateLeadForm(formKey, {
      status: 'submitting',
      message: '',
    })

    try {
      const submittedAt = new Date()
      const dateSent = submittedAt.toISOString().slice(0, 10)

      const responseData = await submitLead(formConfig.webhookUrl, {
        email,
        Email: email,
        formType: formConfig.source,
        source: formConfig.source,
        sourceUrl: window.location.href,
        pageUrl: window.location.href,
        submittedAt: submittedAt.toISOString(),
        dateSent,
        'Date Sent': dateSent,
      })

      updateLeadForm(formKey, {
        email: '',
        status: 'success',
        message: responseData?.message || formConfig.successMessage,
      })
    } catch (error) {
      updateLeadForm(formKey, {
        status: 'error',
        message: getLeadSubmitErrorMessage(error, formConfig),
      })
    }
  }

  const newsletterForm = leadForms.newsletter
  const clubForm = leadForms.club

  return (
    <div className="site-shell">
      <SportsTicker />

      <header className={`site-header${isFooterVisible ? ' site-header--hidden' : ''}`}>
        <div className="site-frame site-header__inner">
          <div className="site-nav-island">
            <nav className="site-nav" aria-label="Primary">
              <a href="#home">Home</a>
              <a href="#about">About</a>
              <a href="#hosts">Hosts</a>
              <a href="#newsletter">Newsletter</a>
            </nav>

            <a className="button button--primary site-nav-island__cta" href="#club">
              Join Club
            </a>
          </div>
        </div>
      </header>

      <main>
        <TacticalHero />

        <section className="section section--podcast-intro" id="about">
          <div className="site-frame section__inner">
            <div className="podcast-intro">
              <p className="eyebrow">About Tiki-Taka Tiki-Talk</p>
              <h2>Soccer conversations built around the way the game moves.</h2>
              <p className="podcast-intro__lede">
                We are an international soccer podcast built on fan interaction, live streaming, and the chaos of the sport we all obsess over. From GOAT debates to Champions League drama, and from unboxing collectibles to live watch along parties, we cover the biggest moments in football with energy and personality. Smart takes, good vibes, and fútbol culture all in one place.
              </p>
            </div>
          </div>
        </section>

        <section className="section section--hosts" id="hosts">
          <div className="site-frame section__inner">
            <div className="hosts-showcase">
              <div className="hosts-showcase__intro">
                <p className="eyebrow">The Hosts</p>
                <h2>Meet the voices behind the soccer chaos.</h2>
                <p className="hosts-showcase__lede">
                  The people driving the debates, reactions, and culture around
                  every Tiki-Taka Tiki-Talk episode.
                </p>
              </div>

              <div className="hosts-grid" aria-label="Podcast hosts">
                {HOSTS.map((host) => (
                  <article className="host-card" key={host.name}>
                    <ProgressivePicture
                      pictureClassName="host-card__picture"
                      className="host-card__image"
                      lowAvifSrc={host.lowAvifSrc}
                      lowFallbackSrc={host.lowFallbackSrc}
                      highAvifSrcSet={host.avifSrcSet}
                      highFallbackSrc={host.fallbackSrc}
                      highFallbackSrcSet={host.fallbackSrcSet}
                      sizes={HOST_IMAGE_SIZES}
                      width="720"
                      height="900"
                      alt={host.alt}
                    />
                    <div className="host-card__body">
                      <p className="host-card__role">Host</p>
                      <h3>{host.name}</h3>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section section--newsletter" id="newsletter">
          <div className="site-frame">
            <div className="newsletter-feature">
              <div className="newsletter-feature__media">
                <ProgressivePicture
                  pictureClassName="newsletter-feature__picture"
                  className="newsletter-feature__image"
                  lowAvifSrc={vinnyNewsletter560Avif}
                  lowFallbackSrc={vinnyNewsletter560Jpg}
                  highAvifSrcSet={`${vinnyNewsletter840Avif} 840w, ${vinnyNewsletter1120Avif} 1120w, ${vinnyNewsletter1535Avif} 1535w`}
                  highFallbackSrc={vinnyNewsletter840Jpg}
                  highFallbackSrcSet={`${vinnyNewsletter840Jpg} 840w, ${vinnyNewsletter1120Jpg} 1120w`}
                  sizes={NEWSLETTER_IMAGE_SIZES}
                  width="1535"
                  height="2048"
                  alt="Vinny playing soccer in a Juventus kit"
                  fetchPriority="low"
                />
              </div>

              <div className="newsletter-feature__content">
                <p className="eyebrow eyebrow--light">Newsletter</p>
                <h2>Receive new content alerts and podcast information first.</h2>
                <p className="newsletter-feature__lede">
                  The newsletter is the free side of the landing page. It is
                  where listeners can subscribe to receive notifications about new
                  content, episode drops, and important information about the
                  podcast.
                </p>

                <ul className="feature-list" aria-label="Newsletter benefits">
                  {NEWSLETTER_BENEFITS.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>

                <form className="newsletter-form" onSubmit={handleLeadSubmit('newsletter')}>
                  <p className="coming-soon-banner">Coming soon</p>
                  <label className="sr-only" htmlFor="email">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="Email address"
                    required
                    value={newsletterForm.email}
                    onChange={handleLeadInputChange('newsletter')}
                    disabled={newsletterForm.status === 'submitting'}
                    aria-invalid={newsletterForm.status === 'error'}
                    aria-describedby={
                      newsletterForm.message ? 'newsletter-form-feedback' : undefined
                    }
                  />
                  <button
                    className="button button--light"
                    type="submit"
                    disabled={newsletterForm.status === 'submitting'}
                  >
                    {newsletterForm.status === 'submitting' ? 'Saving...' : 'Subscribe'}
                  </button>
                  {newsletterForm.message ? (
                    <p
                      className={`form-feedback form-feedback--${newsletterForm.status}`}
                      id="newsletter-form-feedback"
                      role={newsletterForm.status === 'error' ? 'alert' : 'status'}
                    >
                      {newsletterForm.message}
                    </p>
                  ) : null}
                </form>
              </div>
            </div>
          </div>
        </section>

        <section className="section section--club" id="club">
          <div className="site-frame section__inner">
            <div className="club-shell">
              <div className="club-shell__intro">
                <p className="eyebrow eyebrow--light">Join Our Club</p>
                <h2>Subscribe for exclusive content and early access.</h2>
                <p className="club-shell__lede">
                  The club is a separate space from the newsletter. It is built
                  for listeners who want more than updates: exclusive content,
                  members-first releases, and early access before the public drop.
                </p>
                <div className="club-shell__actions">
                  <a className="button button--light" href="#club-access-form">
                    Join The Club
                  </a>
                  <a className="button button--outline-light" href="#newsletter">
                    View Newsletter
                  </a>
                </div>
                <div className="club-shell__media">
                  <img className="club-shell__image" src={clubGraphic} alt="Join Tiki-Talk Club" loading="lazy" />
                </div>
              </div>

              <div className="club-shell__card">
                <p className="club-shell__label">Members Access</p>
                <h3>What opens when you join</h3>
                <p className="club-shell__card-copy">
                  Club membership is the premium route into the show: bonus
                  material, priority access, and a closer line to everything we
                  publish around Tiki Taki Tiki Talk.
                </p>
                <form
                  className="club-form"
                  id="club-access-form"
                  onSubmit={handleLeadSubmit('club')}
                >
                  <p className="coming-soon-banner coming-soon-banner--club">Coming soon</p>
                  <label className="sr-only" htmlFor="club-email">
                    Email address for club access
                  </label>
                  <input
                    id="club-email"
                    name="club-email"
                    type="email"
                    autoComplete="email"
                    placeholder="Email for club access"
                    required
                    value={clubForm.email}
                    onChange={handleLeadInputChange('club')}
                    disabled={clubForm.status === 'submitting'}
                    aria-invalid={clubForm.status === 'error'}
                    aria-describedby={clubForm.message ? 'club-form-feedback' : undefined}
                  />
                  <button
                    className="button button--primary"
                    type="submit"
                    disabled={clubForm.status === 'submitting'}
                  >
                    {clubForm.status === 'submitting' ? 'Saving...' : 'Join Club'}
                  </button>
                  {clubForm.message ? (
                    <p
                      className={`form-feedback form-feedback--${clubForm.status}`}
                      id="club-form-feedback"
                      role={clubForm.status === 'error' ? 'alert' : 'status'}
                    >
                      {clubForm.message}
                    </p>
                  ) : null}
                </form>
                <ul className="perk-list" aria-label="Club benefits">
                  {CLUB_PERKS.map((perk) => (
                    <li key={perk}>{perk}</li>
                  ))}
                </ul>
                <div className="club-shell__highlights">
                  {CLUB_HIGHLIGHTS.map((item) => (
                    <article key={item.title} className="club-highlight">
                      <h4>{item.title}</h4>
                      <p>{item.copy}</p>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}

export default App
