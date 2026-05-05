import './App.css'
import SiteFooter from './components/SiteFooter'
import TacticalHero from './components/TacticalHero'
import ginoImage from './imgs/Gino.png'

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
    copy: 'Members-only breakdowns, bonus drops, and extra football conversation.',
  },
  {
    title: 'Early Access',
    copy: 'Get in before public release when we open selected episodes and special content.',
  },
]

function App() {
  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="site-frame site-header__inner">
          <div className="site-nav-island">
            <nav className="site-nav" aria-label="Primary">
              <a href="#home">Home</a>
              <a href="#about">About</a>
              <a href="#newsletter">Newsletter</a>
              <a href="#club">Club</a>
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
              <p className="eyebrow">About The Podcast</p>
              <h2>Football conversation built around the way the game moves.</h2>
              <p className="podcast-intro__lede">
                Tiki Taki Tiki Talk is a football podcast about tactics, rhythm,
                and the small decisions that change a match. We break down the
                ideas behind the game in a way that stays sharp, simple, and fun
                to follow.
              </p>
            </div>
          </div>
        </section>

        <section className="section section--origin">
          <div className="site-frame">
            <div className="origin-panel">
              <div className="origin-panel__grid">
                <article className="origin-note">
                  <h3>Why we chose the name</h3>
                  <p>
                    We chose &quot;Tiki Taka Tiki Talk&quot; because the title sounds
                    like the game we love: quick, connected, and full of rhythm.
                    It turns a famous football idea into conversation, which fits a
                    podcast built on sharp passing of ideas between hosts and
                    listeners.
                  </p>
                </article>

                <article className="origin-note">
                  <h3>What tiki-taka means</h3>
                  <p>
                    Tiki-taka is a football strategy based on short passing,
                    constant movement, close support, and patient possession. The
                    goal is to control space and tempo by keeping the ball moving,
                    creating triangles, and pulling opponents out of shape before
                    finding the opening.
                  </p>
                </article>
              </div>
            </div>
          </div>
        </section>

       

        <section className="section section--newsletter" id="newsletter">
          <div className="site-frame">
            <div className="newsletter-feature">
              <div className="newsletter-feature__media">
                <img
                  className="newsletter-feature__image"
                  src={ginoImage}
                  alt="Gino standing in a suit"
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

                <form className="newsletter-form" onSubmit={(event) => event.preventDefault()}>
                  <label className="sr-only" htmlFor="email">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="Email address"
                  />
                  <button className="button button--light" type="submit">
                    Subscribe
                  </button>
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
                  onSubmit={(event) => event.preventDefault()}
                >
                  <label className="sr-only" htmlFor="club-email">
                    Email address for club access
                  </label>
                  <input
                    id="club-email"
                    name="club-email"
                    type="email"
                    autoComplete="email"
                    placeholder="Email for club access"
                  />
                  <button className="button button--primary" type="submit">
                    Join Club
                  </button>
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
