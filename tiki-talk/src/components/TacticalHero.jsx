import heroBackground from '../assets/Tiki Taka Hero Section Background.png'

function TacticalHero() {
  return (
    <section
      className="hero"
      id="home"
      style={{ '--hero-background': `url(${heroBackground})` }}
    >
      <div className="hero__media" aria-hidden="true" />

      <div className="site-frame hero__layout">
        <div className="hero__content">
          <div className="hero__copy">
            <h1>
              <span className="hero__title-word hero__title-word--tiki-first">Tiki</span>
              <span className="hero__title-dash">-</span>
              <span className="hero__title-word hero__title-word--taka">Taka</span>
              <br />
              <span className="hero__title-word hero__title-word--tiki-second">Tiki</span>
              <span className="hero__title-dash">-</span>
              <span className="hero__title-word hero__title-word--talk">Talk</span>
              <br />
              Goes beyond the pitch.
            </h1>
            <p className="hero__lede">
              Football debates, tactical insights, and the culture surrounding the game.
              that shape every result.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default TacticalHero
