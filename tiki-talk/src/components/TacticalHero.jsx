import heroBackground from '../imgs/photo-1695326402341-e980b09af856.avif'

function TacticalHero({ matchup }) {
  return (
    <section
      className="hero"
      id="home"
      style={{ '--hero-background': `url(${heroBackground})` }}
    >
      <div className="hero__media" aria-hidden="true" />
      <div className="hero__scrim" aria-hidden="true" />

      <div className="site-frame hero__content">
        <div className="hero__copy">
          <p className="eyebrow">Soccer Podcast</p>
          <div className="hero__matchup" aria-label="Current matchup">
            <span>{matchup.attack.name}</span>
            <span>builds</span>
            <span>{matchup.defense.name}</span>
          </div>
          <h1>Editorial football with a wide view of the match.</h1>
          <p className="hero__lede">
            Tiki Taki Tiki Talk opens on the full picture, then works inward:
            structure, tempo, and the details that tilt a result. Each visit
            still drops a fresh international pairing into the frame.
          </p>
          <div className="hero__actions">
            <a className="button button--primary" href="#newsletter">
              Subscribe
            </a>
            <a className="button button--ghost" href="#about">
              Read The Shape
            </a>
          </div>
        </div>

        <aside className="hero__panel" aria-label="Matchup card">
          <p className="hero__panel-kicker">This Week&apos;s Frame</p>
          <h2>One wide image, then straight into the analysis.</h2>
          <p>
            The landing page now opens with a horizontal stadium shot while the
            notebooks, metrics, and premium notes carry the rest of the story.
          </p>

          <div className="hero__panel-teams">
            <div>
              <span>Ball side</span>
              <strong>{matchup.attack.name}</strong>
            </div>
            <div>
              <span>Press side</span>
              <strong>{matchup.defense.name}</strong>
            </div>
          </div>
        </aside>
      </div>
    </section>
  )
}

export default TacticalHero
