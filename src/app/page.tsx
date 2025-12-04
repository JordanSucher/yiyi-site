import Link from 'next/link'
import { getAllShows, getSiteSettings } from '@/lib/content'

export default function Home() {
  const shows = getAllShows()
  const settings = getSiteSettings()

  // Get upcoming shows (limit to 3)
  const upcomingShows = shows
    .filter((show) => new Date(show.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3)

  const formatShowDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', position: 'relative', zIndex: 2 }}>

        {/* Hero Section - Fire Ritual */}
        <section
          style={{
            position: 'relative',
            margin: '0 0 2rem',
            animation: 'fadeRise 1.5s ease-out 0.5s both'
          }}
        >
          <div
            style={{
              position: 'relative',
              maxWidth: '800px',
              margin: '0 auto',
              padding: '5rem 3rem',
              textAlign: 'center'
            }}
          >
            {/* Ornate corner decorations */}
            <div style={{
              position: 'absolute',
              top: '2rem',
              left: '2rem',
              color: 'var(--copper)',
              fontSize: '2rem',
              opacity: 0.4,
              animation: 'flicker 5s ease-in-out infinite'
            }}>◈</div>
            <div style={{
              position: 'absolute',
              top: '2rem',
              right: '2rem',
              color: 'var(--sage)',
              fontSize: '1.6rem',
              opacity: 0.3,
              animation: 'flicker 7s ease-in-out infinite 2s'
            }}>⟐</div>
            <div style={{
              position: 'absolute',
              bottom: '2rem',
              left: '2rem',
              color: 'var(--wine)',
              fontSize: '1.8rem',
              opacity: 0.35,
              animation: 'flicker 6s ease-in-out infinite 1s'
            }}>⟢</div>
            <div style={{
              position: 'absolute',
              bottom: '2rem',
              right: '2rem',
              color: 'var(--ember)',
              fontSize: '1.4rem',
              opacity: 0.4,
              animation: 'flicker 4s ease-in-out infinite 3s'
            }}>◉</div>

            <h2
              style={{
                fontFamily: 'Libre Baskerville, serif',
                fontSize: 'clamp(2rem, 5vw, 3rem)',
                fontWeight: 400,
                fontStyle: 'italic',
                marginBottom: '2rem',
                color: 'var(--moonlight)',
                lineHeight: '1.4',
                position: 'relative'
              }}
            >
              {settings.site.heroTitle}
            </h2>
            <p
              style={{
                fontSize: 'clamp(1.1rem, 2.2vw, 1.35rem)',
                lineHeight: '1.9',
                color: 'var(--smoke)',
                maxWidth: '600px',
                margin: '0 auto',
                fontWeight: 300
              }}
            >
              {settings.site.heroDescription}
            </p>
          </div>
        </section>

        {/* Shows Section */}
        {upcomingShows.length > 0 && (
          <section
            style={{
              margin: '2rem 0 8rem',
              animation: 'fadeRise 1.5s ease-out 0.8s both'
            }}
          >
            <h2
              style={{
                fontFamily: 'Libre Baskerville, serif',
                fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
                fontWeight: 700,
                marginBottom: '4rem',
                textAlign: 'center',
                position: 'relative',
                color: 'var(--moonlight)'
              }}
            >
              <span style={{
                position: 'absolute',
                left: '-3rem',
                color: 'var(--copper)',
                fontSize: '0.6em',
                top: '50%',
                transform: 'translateY(-50%)',
                animation: 'flicker 4s ease-in-out infinite'
              }}>◈</span>
              <span style={{
                position: 'absolute',
                left: '-4.5rem',
                color: 'var(--sage)',
                fontSize: '0.4em',
                top: '50%',
                transform: 'translateY(-50%)',
                opacity: 0.6
              }}>⟐</span>
              {settings.site.showsTitle}
              <span style={{
                position: 'absolute',
                right: '-3rem',
                color: 'var(--copper)',
                fontSize: '0.6em',
                top: '50%',
                transform: 'translateY(-50%)',
                animation: 'flicker 4s ease-in-out infinite'
              }}>◈</span>
              <span style={{
                position: 'absolute',
                right: '-4.5rem',
                color: 'var(--sage)',
                fontSize: '0.4em',
                top: '50%',
                transform: 'translateY(-50%)',
                opacity: 0.6
              }}>⟐</span>
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '3rem',
                maxWidth: '900px',
                margin: '0 auto'
              }}
            >
              {upcomingShows.map((show) => (
                <div
                  key={show.slug}
                  className="show-card"
                  style={{
                    padding: '1.5rem'
                  }}
                >
                  <span style={{
                    position: 'absolute',
                    top: '1.5rem',
                    right: '1.5rem',
                    color: 'var(--copper)',
                    fontSize: '1.4rem',
                    opacity: 0.6
                  }}>◈</span>
                  <span style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '2.5rem',
                    color: 'var(--sage)',
                    fontSize: '0.8rem',
                    opacity: 0.4
                  }}>⟐</span>
                  <span
                    style={{
                      fontFamily: 'Libre Baskerville, serif',
                      fontSize: '2.2rem',
                      fontWeight: 700,
                      color: 'var(--ember)',
                      marginBottom: '1.5rem',
                      display: 'block'
                    }}
                  >
                    {formatShowDate(show.date)}
                  </span>
                  <div
                    style={{
                      fontSize: '1.3rem',
                      fontWeight: 400,
                      marginBottom: '0.5rem',
                      color: 'var(--moonlight)'
                    }}
                  >
                    {show.venue}
                  </div>
                  <div
                    style={{
                      color: 'var(--herb)',
                      fontSize: '1rem',
                      fontWeight: 300,
                      letterSpacing: '0.05em',
                      marginBottom: '1rem'
                    }}
                  >
                    {show.location}
                  </div>
                  {(show.ticketUrl || show.url) && (
                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                      {show.ticketUrl && (
                        <a
                          href={show.ticketUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ticket-button"
                          style={{
                            fontSize: '0.85rem',
                            padding: '0.5rem 1rem'
                          }}
                        >
                          Tickets
                        </a>
                      )}
                      {show.url && (
                        <a
                          href={show.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-block',
                            padding: '0.5rem 1rem',
                            border: '1px solid var(--sage)',
                            backgroundColor: 'rgba(156, 174, 133, 0.1)',
                            color: 'var(--moonlight)',
                            textDecoration: 'none',
                            fontSize: '0.85rem',
                            borderRadius: '2px',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          Info
                        </a>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Link to all shows */}
            <div style={{ textAlign: 'center', marginTop: '4rem' }}>
              <Link
                href="/shows"
                className="ticket-button"
                style={{
                  position: 'relative',
                  fontSize: '1.1rem'
                }}
              >
                All Shows
              </Link>
            </div>
          </section>
        )}


        {/* Contact Section */}
        <section
          style={{
            margin: '8rem 0 4rem',
            textAlign: 'center',
            animation: 'fadeIn 1.8s ease-out 1.5s both'
          }}
        >
          <div className="contact-section">

            <h3
              style={{
                fontFamily: 'Libre Baskerville, serif',
                fontSize: '2rem',
                marginBottom: '1rem',
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
                fontSize: '1.2rem',
                letterSpacing: '0.03em',
                display: 'block',
                marginBottom: '1rem'
              }}
            >
              {settings.site.contactEmail}
            </a>
            <a
              href={settings.site.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-email"
              style={{
                fontSize: '1.2rem',
                letterSpacing: '0.03em'
              }}
            >
              Instagram
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
            marginTop: '4rem'
          }}
        >
          <p>{settings.site.footerText}</p>
        </footer>
      </div>
    </>
  )
}

