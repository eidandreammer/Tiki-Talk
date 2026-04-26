import './App.css'
import TacticalHero from './components/TacticalHero'

const NOTEBOOK_CARDS = [
  {
    title: 'Match Film, Not Hot Takes',
    body:
      'Every episode starts from the tape. The arguments come after the freeze-frame, not before it.',
  },
  {
    title: 'Tactical Shape, Cultural Noise',
    body:
      'We move from pressing triggers and half-spaces into dressing-room politics, transfer tension, and tournament mood.',
  },
  {
    title: 'Built For Paying Members',
    body:
      'The landing page stays open. The sharpest breakdowns, chalkboard notes, and listener mail live behind the wall.',
  },
]

const SUBSCRIBER_PERKS = [
  'Tactical notebooks published after every episode',
  'Weekly member-only newsletter with clips and diagrams',
  'Early access to live rooms before major tournaments',
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
            </nav>

            <a className="button button--primary site-nav-island__cta" href="#newsletter">
              Subscribe
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
          <div className="site-frame section__inner">
            <div className="newsletter-panel">
              <div className="newsletter-panel__copy">
                <p className="eyebrow">Newsletter</p>
                <h2>Subscribe for the diagrams, the clips, and the premium wall.</h2>
                <p>
                  The free list gets episode drops and brief notes. Subscribers
                  get the tactical board, full transcripts, and match-day memos.
                </p>
              </div>

              <div className="newsletter-panel__perks">
                <ul className="perk-list" aria-label="Subscriber perks">
                  {SUBSCRIBER_PERKS.map((perk) => (
                    <li key={perk}>{perk}</li>
                  ))}
                </ul>
              </div>

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
                <button className="button button--primary" type="submit">
                  Join The List
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
