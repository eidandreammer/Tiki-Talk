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
        <div className="hero__topbar">
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

        <div className="hero__content">
          <div className="hero__copy">
            <h1>Editorial football with a wide view of the match.</h1>
            <p className="hero__lede">
              A podcast about football ideas, match rhythm, and the tactical details
              that shape every result.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default TacticalHero
