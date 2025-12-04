'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface HeaderProps {
  siteTitle: string
}

export default function Header({ siteTitle }: HeaderProps) {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <header
      style={{
        padding: '3rem 0 2rem',
        textAlign: 'center',
        animation: 'fadeGlow 2s ease-out',
        marginTop: '3rem'
      }}
    >
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '220px',
            height: '220px',
            border: '2px solid var(--copper)',
            borderRadius: '50%',
            opacity: 0.4,
            animation: 'rotate 60s linear infinite'
          }}
        >
          <div style={{
            position: 'absolute',
            top: '-12px',
            left: '50%',
            transform: 'translateX(-50%)',
            color: 'var(--copper)',
            fontSize: '1.4rem'
          }}>⟐</div>
          <div style={{
            position: 'absolute',
            bottom: '-12px',
            left: '50%',
            transform: 'translateX(-50%)',
            color: 'var(--copper)',
            fontSize: '1.4rem'
          }}>⟐</div>
          <div style={{
            position: 'absolute',
            left: '-12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--sage)',
            fontSize: '1.2rem'
          }}>◈</div>
          <div style={{
            position: 'absolute',
            right: '-12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--sage)',
            fontSize: '1.2rem'
          }}>◈</div>
        </div>
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '280px',
            height: '280px',
            border: '1px dotted var(--sage)',
            borderRadius: '50%',
            opacity: 0.2,
            animation: 'rotate 80s linear infinite reverse'
          }}
        />
        <Link href="/">
          <h1
            style={{
              fontFamily: 'Libre Baskerville, serif',
              fontSize: 'clamp(2.5rem, 8vw, 5rem)',
              fontWeight: 700,
              letterSpacing: '0.15em',
              color: 'var(--moonlight)',
              marginBottom: '0.5rem',
              position: 'relative',
              textTransform: 'lowercase',
              fontStyle: 'italic',
              textDecoration: 'none',
              cursor: 'pointer'
            }}
          >
            {siteTitle}
          </h1>
        </Link>
      </div>

      {/* Navigation */}
      <nav style={{ marginTop: '2rem', position: 'relative', zIndex: 10 }}>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '2rem',
          flexWrap: 'wrap',
          position: 'relative',
          zIndex: 10
        }}>
          <Link
            href="/"
            style={{
              color: isActive('/') ? 'var(--ember)' : 'var(--herb)',
              textDecoration: 'none',
              fontSize: '1rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              transition: 'color 0.3s ease',
              fontWeight: isActive('/') ? 600 : 400,
              cursor: 'pointer',
              position: 'relative',
              zIndex: 20,
              display: 'inline-block',
              padding: '0.5rem'
            }}
          >
            Home
          </Link>
          <Link
            href="/shows"
            style={{
              color: isActive('/shows') ? 'var(--ember)' : 'var(--herb)',
              textDecoration: 'none',
              fontSize: '1rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              transition: 'color 0.3s ease',
              fontWeight: isActive('/shows') ? 600 : 400,
              cursor: 'pointer',
              position: 'relative',
              zIndex: 20,
              display: 'inline-block',
              padding: '0.5rem'
            }}
          >
            Shows
          </Link>
          <Link
            href="/music"
            style={{
              color: isActive('/music') ? 'var(--ember)' : 'var(--herb)',
              textDecoration: 'none',
              fontSize: '1rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              transition: 'color 0.3s ease',
              fontWeight: isActive('/music') ? 600 : 400,
              cursor: 'pointer',
              position: 'relative',
              zIndex: 20,
              display: 'inline-block',
              padding: '0.5rem'
            }}
          >
            Music
          </Link>
        </div>
      </nav>
    </header>
  )
}