import Link from 'next/link'
import { getSiteSettings } from '@/lib/content'

interface Show {
  slug: string
  title: string
  date: string
  venue: string
  location: string
  content?: string
  ticketUrl?: string
  url?: string
}

async function getShows(): Promise<Show[]> {
  // Always fetch from the API endpoint - this works in both dev and production
  try {
    const response = await fetch(`${process.env.NEXTJS_URL || 'http://localhost:3000'}/api/shows`, {
      cache: 'no-store' // Ensure we always get fresh data
    })
    if (!response.ok) {
      console.error('Failed to fetch shows:', response.status)
      return []
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching shows:', error)
    return []
  }
}

export default async function Shows() {
  const shows = await getShows()
  const settings = getSiteSettings()

  // Separate upcoming and past shows
  const currentDate = new Date()
  const upcomingShows = shows.filter(show => new Date(show.date) >= currentDate)
  const pastShows = shows.filter(show => new Date(show.date) < currentDate)

  const formatShowDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const ShowCard = ({ show, isPast = false }: { show: Show, isPast?: boolean }) => {
    const dateInfo = formatShowDate(show.date)

    return (
      <div
        className={`${isPast ? 'past-show-card' : 'show-card'}`}
        style={{
          padding: '1.5rem'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
          <div>
            <span
              style={{
                fontFamily: 'Libre Baskerville, serif',
                fontSize: '1.8rem',
                fontWeight: 700,
                color: 'var(--copper)',
                display: 'block',
                marginBottom: '0.5rem'
              }}
            >
              {dateInfo}
            </span>
            <h3
              style={{
                fontSize: '1.4rem',
                fontWeight: 600,
                marginBottom: '0.5rem',
                color: 'var(--moonlight)'
              }}
            >
              {show.title}
            </h3>
          </div>
          <span style={{
            color: 'var(--sage)',
            fontSize: '1.2rem',
            opacity: 0.6
          }}>◈</span>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <div
            style={{
              fontSize: '1.2rem',
              fontWeight: 500,
              marginBottom: '0.3rem',
              color: 'var(--moonlight)'
            }}
          >
            {show.venue}
          </div>
          <div
            style={{
              color: 'var(--herb)',
              fontSize: '1rem',
              fontWeight: 300
            }}
          >
            {show.location}
          </div>
        </div>

        {show.content && (
          <p
            style={{
              fontSize: '0.95rem',
              lineHeight: '1.6',
              color: 'var(--smoke)',
              marginBottom: '1.5rem'
            }}
          >
            {show.content}
          </p>
        )}

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {show.ticketUrl && !isPast && (
            <a
              href={show.ticketUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ticket-button"
              style={{
                fontSize: '0.9rem',
                padding: '0.6rem 1.2rem'
              }}
            >
              Get Tickets
            </a>
          )}
          {show.url && (
            <a
              href={show.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                padding: '0.6rem 1.2rem',
                border: '1px solid var(--sage)',
                backgroundColor: 'rgba(156, 174, 133, 0.1)',
                color: 'var(--moonlight)',
                textDecoration: 'none',
                fontSize: '0.9rem',
                borderRadius: '2px',
                transition: 'all 0.3s ease'
              }}
            >
              More Info
            </a>
          )}
        </div>
      </div>
    )
  }

  return (
    <>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 2rem', position: 'relative', zIndex: 2 }}>

        {/* Upcoming Shows */}
        {upcomingShows.length > 0 && (
          <section style={{ marginBottom: '4rem' }}>
            <h2
              style={{
                fontFamily: 'Libre Baskerville, serif',
                fontSize: '2.5rem',
                fontWeight: 600,
                color: 'var(--moonlight)',
                marginBottom: '3rem',
                textAlign: 'center'
              }}
            >
              Upcoming Shows
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1.5rem'
            }}>
              {upcomingShows.map((show) => (
                <ShowCard key={show.slug} show={show} />
              ))}
            </div>
          </section>
        )}

        {/* Past Shows */}
        {pastShows.length > 0 && (
          <section>
            <h2
              style={{
                fontFamily: 'Libre Baskerville, serif',
                fontSize: '2.5rem',
                fontWeight: 600,
                color: 'var(--moonlight)',
                marginBottom: '3rem',
                textAlign: 'center',
                opacity: 0.8
              }}
            >
              Past Shows
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1.5rem'
            }}>
              {pastShows.map((show) => (
                <ShowCard key={show.slug} show={show} isPast />
              ))}
            </div>
          </section>
        )}

        {shows.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <p style={{
              fontSize: '1.2rem',
              color: 'var(--smoke)',
              fontStyle: 'italic'
            }}>
              No shows scheduled at this time.
            </p>
          </div>
        )}

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
