import Link from 'next/link'
import { getSiteSettings } from '@/lib/content'

export default function About() {
  const settings = getSiteSettings()

  return (
    <>
      {/* Ritual symbols floating in background */}
      <div className="ritual-symbol symbol-1">◬</div>
      <div className="ritual-symbol symbol-2">◉</div>
      <div className="ritual-symbol symbol-3">✺</div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 clamp(1rem, 4vw, 2rem)', position: 'relative', zIndex: 2 }}>
        {/* Header Navigation */}
        <header
          style={{
            padding: 'clamp(2rem, 6vw, 4rem) 0 clamp(1.5rem, 4vw, 3rem)',
            textAlign: 'center'
          }}
        >
          <div style={{ marginBottom: '2rem' }}>
            <Link
              href="/"
              style={{
                fontFamily: 'Libre Baskerville, serif',
                fontSize: 'clamp(2.5rem, 6vw, 4rem)',
                fontWeight: 700,
                letterSpacing: '0.15em',
                color: 'var(--moonlight)',
                textDecoration: 'none',
                textTransform: 'lowercase',
                fontStyle: 'italic'
              }}
            >
              yi yi
            </Link>
          </div>
          <nav style={{ marginBottom: '3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(1.5rem, 4vw, 3rem)', flexWrap: 'wrap' }}>
              <Link
                href="/"
                className="nav-link"
              >
                Home
              </Link>
              <Link
                href="/shows"
                className="nav-link"
              >
                {settings.site.showsTitle}
              </Link>
              <span
                style={{
                  color: 'var(--ember)',
                  fontSize: '1.1rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase'
                }}
              >
                {settings.site.aboutTitle}
              </span>
            </div>
          </nav>
        </header>

        {/* Page Title */}
        <section style={{ textAlign: 'center', marginBottom: '6rem' }}>
          <h1
            style={{
              fontFamily: 'Libre Baskerville, serif',
              fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
              fontWeight: 700,
              marginBottom: '2rem',
              position: 'relative',
              color: 'var(--moonlight)'
            }}
          >
            <span style={{
              position: 'absolute',
              left: 'clamp(-1.5rem, -5vw, -2.5rem)',
              color: 'var(--ember)',
              fontSize: '0.5em',
              top: '50%',
              transform: 'translateY(-50%)',
              animation: 'flicker 3s ease-in-out infinite'
            }}>⟡</span>
            {settings.site.aboutTitle}
            <span style={{
              position: 'absolute',
              right: 'clamp(-1.5rem, -5vw, -2.5rem)',
              color: 'var(--ember)',
              fontSize: '0.5em',
              top: '50%',
              transform: 'translateY(-50%)',
              animation: 'flicker 3s ease-in-out infinite'
            }}>⟡</span>
          </h1>
        </section>

        {/* About Content */}
        <section
          style={{
            margin: '6rem 0',
            animation: 'fadeRise 1.5s ease-out 0.5s both'
          }}
        >
          <div
            style={{
              maxWidth: '800px',
              margin: '0 auto',
              padding: 'clamp(2rem, 6vw, 5rem) clamp(1rem, 6vw, 4rem)',
              borderTop: '2px solid var(--moss)',
              borderBottom: '2px solid var(--moss)',
              position: 'relative',
              textAlign: 'center'
            }}
          >
            {/* Decorative elements */}
            <div style={{
              position: 'absolute',
              top: '-1rem',
              left: '50%',
              transform: 'translateX(-50%)',
              color: 'var(--herb)',
              fontSize: '2.5rem',
              opacity: 0.4
            }}>❋</div>
            <div style={{
              position: 'absolute',
              bottom: '-1rem',
              left: '50%',
              transform: 'translateX(-50%)',
              color: 'var(--herb)',
              fontSize: '2.5rem',
              opacity: 0.4
            }}>❋</div>

            {/* Side decorations */}
            <div style={{
              position: 'absolute',
              left: 'clamp(-1rem, -4vw, -2rem)',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--moss)',
              fontSize: '1.5rem',
              opacity: 0.3,
              animation: 'breathe 6s ease-in-out infinite'
            }}>◈</div>
            <div style={{
              position: 'absolute',
              right: 'clamp(-1rem, -4vw, -2rem)',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--moss)',
              fontSize: '1.5rem',
              opacity: 0.3,
              animation: 'breathe 6s ease-in-out infinite 2s'
            }}>◈</div>

            <p
              style={{
                fontSize: 'clamp(1.2rem, 2.5vw, 1.5rem)',
                lineHeight: '2.1',
                color: 'var(--smoke)',
                fontWeight: 300,
                letterSpacing: '0.02em'
              }}
            >
              {settings.site.aboutContent}
            </p>
          </div>
        </section>

        {/* Contact Section */}
        <section
          style={{
            margin: '8rem 0 6rem',
            textAlign: 'center',
            animation: 'fadeIn 1.8s ease-out 1s both'
          }}
        >
          <div
            className="contact-section"
            style={{
              position: 'relative'
            }}
          >
            {/* Outer border decoration */}
            <div style={{
              position: 'absolute',
              top: '-10px',
              left: '-10px',
              right: '-10px',
              bottom: '-10px',
              border: '1px solid var(--ember)',
              opacity: 0.3
            }}></div>

            {/* Corner decorations */}
            <div style={{
              position: 'absolute',
              top: '-8px',
              left: '-8px',
              color: 'var(--ember)',
              fontSize: '1.2rem'
            }}>✦</div>
            <div style={{
              position: 'absolute',
              top: '-8px',
              right: '-8px',
              color: 'var(--ember)',
              fontSize: '1.2rem'
            }}>✦</div>
            <div style={{
              position: 'absolute',
              bottom: '-8px',
              left: '-8px',
              color: 'var(--ember)',
              fontSize: '1.2rem'
            }}>✦</div>
            <div style={{
              position: 'absolute',
              bottom: '-8px',
              right: '-8px',
              color: 'var(--ember)',
              fontSize: '1.2rem'
            }}>✦</div>

            <h3
              style={{
                fontFamily: 'Libre Baskerville, serif',
                fontSize: '2.2rem',
                marginBottom: '1.5rem',
                color: 'var(--moonlight)',
                fontWeight: 400
              }}
            >
              {settings.site.contactTitle}
            </h3>
            <a
              href={`mailto:${settings.site.contactEmail}`}
              className="contact-email"
              style={{
                letterSpacing: '0.05em'
              }}
            >
              {settings.site.contactEmail}
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer
          style={{
            textAlign: 'center',
            padding: '4rem 0 3rem',
            color: 'var(--earth)',
            fontSize: '0.9rem',
            letterSpacing: '0.1em',
            borderTop: '1px solid var(--earth)',
            marginTop: '4rem'
          }}
        >
          <p>{settings.site.footerText}</p>
        </footer>
      </div>
    </>
  )
}