import { useState } from 'react'
import './App.css'
import TacticalHero from './components/TacticalHero'
import { TEAMS } from './data/teams'
import { pickRandomTeams } from './lib/tactics'

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

const BROADCAST_METRICS = [
  { value: '03', label: 'drops each week' },
  { value: '22', label: 'magnetic nodes in play' },
  { value: '90', label: 'minutes under review' },
]

const SUBSCRIBER_PERKS = [
  'Tactical notebooks published after every episode',
  'Weekly member-only newsletter with clips and diagrams',
  'Early access to live rooms before major tournaments',
]

function App() {
  const [matchup] = useState(() => pickRandomTeams(TEAMS))

  return (
    <div className="site-shell">
      <main>
        <TacticalHero matchup={matchup} />

        <section className="section section--split" id="about">
          <div className="site-frame section__inner">
            <div className="section__intro">
              <p className="eyebrow">About The Show</p>
              <h2>Editorial football, structured like a clean passing move.</h2>
              <p className="section__lede">
                Tiki Taki Tiki Talk is a soccer podcast about rhythm, structure, and the
                stories that bend matches out of shape. One refresh gives you{' '}
                <strong>{matchup.attack.name}</strong> building from the back and{' '}
                <strong>{matchup.defense.name}</strong> trying to shut the lane.
              </p>
            </div>

            <div className="section__content">
              <div className="metric-row" aria-label="Podcast metrics">
                {BROADCAST_METRICS.map((metric) => (
                  <article className="metric-card" key={metric.label}>
                    <span className="metric-card__value">{metric.value}</span>
                    <span className="metric-card__label">{metric.label}</span>
                  </article>
                ))}
              </div>

              <div className="copy-grid">
                <p>
                  The voice is editorial and direct. The visual language stays
                  spare: bold type, quiet separators, and enough restraint to make
                  the argument land.
                </p>
                <p>
                  The hero image sets the tone. A horizontal stadium frame opens
                  the page before the notebooks, metrics, and premium notes take
                  over.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="site-frame section__inner">
            <div className="section__intro">
              <p className="eyebrow">What Members Get</p>
              <h2>The notebook behind the microphone.</h2>
            </div>

            <div className="card-grid">
              {NOTEBOOK_CARDS.map((card) => (
                <article className="info-card" key={card.title}>
                  <h3>{card.title}</h3>
                  <p>{card.body}</p>
                </article>
              ))}
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

              <div className="perk-list" aria-label="Subscriber perks">
                {SUBSCRIBER_PERKS.map((perk) => (
                  <p key={perk}>{perk}</p>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
