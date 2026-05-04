import joinUsImage from '../imgs/Join us.png'

const FOOTER_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Club', href: '#club' },
  { label: 'Newsletter', href: '#newsletter' },
]

const SOCIAL_LINKS = [
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/',
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <rect x="3.25" y="3.25" width="17.5" height="17.5" rx="5" />
        <circle cx="12" cy="12" r="4.15" />
        <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: 'TikTok',
    href: 'https://www.tiktok.com/',
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M14.15 4.25c.62 1.64 1.94 3.03 3.53 3.71a6.6 6.6 0 0 0 2.07.5" />
        <path d="M14.15 7.4v7.56a4.8 4.8 0 1 1-4.8-4.8" />
        <path d="M14.15 4.25v10.71" />
      </svg>
    ),
  },
  {
    label: 'X',
    href: 'https://x.com/',
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M4.5 4.5 19.5 19.5" />
        <path d="M19.5 4.5 4.5 19.5" />
      </svg>
    ),
  },
  {
    label: 'YouTube',
    href: 'https://www.youtube.com/',
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M21 12c0 2.62-.28 4.28-.74 5.08-.41.72-1.07 1.21-1.88 1.38C17.32 18.7 14.95 19 12 19c-2.95 0-5.32-.3-6.38-.54-.81-.17-1.47-.66-1.88-1.38C3.28 16.28 3 14.62 3 12c0-2.62.28-4.28.74-5.08.41-.72 1.07-1.21 1.88-1.38C6.68 5.3 9.05 5 12 5c2.95 0 5.32.3 6.38.54.81.17 1.47.66 1.88 1.38.46.8.74 2.46.74 5.08Z" />
        <path d="m10 9.25 5 2.75-5 2.75Z" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
]

function SiteFooter() {
  return (
    <footer className="site-footer" id="join-us">
      <div className="site-frame">
        <div className="site-footer__panel">
          <div className="site-footer__art">
            <div className="site-footer__art-card">
              <img className="site-footer__art-image" src={joinUsImage} alt="Join our club" />
            </div>
          </div>

          <nav className="site-footer__menu" aria-label="Footer">
            <p className="site-footer__label">Menu</p>
            <div className="site-footer__menu-links">
              {FOOTER_LINKS.map((link) => (
                <a key={link.label} className="site-footer__menu-link" href={link.href}>
                  {link.label}
                </a>
              ))}
            </div>
          </nav>

          <div className="site-footer__subscribe" id="footer-subscribe">
            <p className="site-footer__label">Choose Your Access</p>
            <h2>Newsletter for updates. Club for exclusive access.</h2>
            <p className="site-footer__subscribe-copy">
              Keep the free newsletter for new content and podcast information,
              or step into the club for exclusive content and early access.
            </p>

            <div className="site-footer__actions">
              <a className="button button--footer" href="#newsletter">
                Newsletter
              </a>
              <a className="button button--ghost" href="#club">
                Join Club
              </a>
            </div>
          </div>

          <div className="site-footer__social">
            <p className="site-footer__label">Follow Us</p>
            <div className="site-footer__social-links">
              {SOCIAL_LINKS.map((link) => (
                <a
                  key={link.label}
                  className="site-footer__social-link"
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={link.label}
                >
                  {link.icon}
                </a>
              ))}
            </div>
            <p className="site-footer__social-copy">
              Follow for clips, release alerts, and short tactical breakdowns.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default SiteFooter
