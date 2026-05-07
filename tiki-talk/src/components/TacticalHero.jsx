import heroBackground from '../imgs/hero section backgroun.png'

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
              Tiki Taka Tiki-Talk
              <br />
              Beyond the pitch.
            </h1>
            <div className="hero__lede-shell">
              <p className="hero__lede">
                A podcast about football ideas, match rhythm, and the tactical details
                that shape every result.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default TacticalHero
