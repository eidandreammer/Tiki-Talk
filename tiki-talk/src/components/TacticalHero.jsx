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
            <h1>Tiki-Taka <br /> Tiki-Talk <br /> Goes beyond the pitch.</h1>
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
