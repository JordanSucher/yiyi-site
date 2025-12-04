'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface MusicSample {
  id: string
  title: string
  description: string
  type: 'video' | 'audio' | 'link'
  videoUrl?: string
  audioUrl?: string
  linkUrl?: string
  linkText?: string
  order?: number
}

export default function Music() {
  const [musicSamples, setMusicSamples] = useState<MusicSample[]>([])
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState<any>(null)

  useEffect(() => {
    // Load settings and music samples
    Promise.all([
      fetch('/api/settings').then(res => res.json()),
      fetch('/api/music-samples').then(res => res.json())
    ])
      .then(([settingsData, samplesData]) => {
        setSettings(settingsData)
        setMusicSamples(samplesData)
        setLoading(false)
      })
      .catch(error => {
        console.error('Error loading data:', error)
        setLoading(false)
      })
  }, [])

  if (loading || !settings) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--moonlight)'
      }}>
        Loading...
      </div>
    )
  }

  return (
    <>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 2rem', position: 'relative', zIndex: 2 }}>

        {/* Music Samples Section */}
        <section style={{ marginBottom: '4rem' }}>
          <h2
            style={{
              fontFamily: 'Libre Baskerville, serif',
              fontSize: 'clamp(2.5rem, 8vw, 4rem)',
              fontWeight: 700,
              color: 'var(--moonlight)',
              marginBottom: '3rem',
              textAlign: 'center',
              position: 'relative'
            }}
          >
            <span style={{
              position: 'absolute',
              left: '-2rem',
              color: 'var(--copper)',
              fontSize: '0.6em',
              top: '50%',
              transform: 'translateY(-50%)',
              animation: 'flicker 4s ease-in-out infinite'
            }}>◈</span>
            Music
            <span style={{
              position: 'absolute',
              right: '-2rem',
              color: 'var(--copper)',
              fontSize: '0.6em',
              top: '50%',
              transform: 'translateY(-50%)',
              animation: 'flicker 4s ease-in-out infinite'
            }}>◈</span>
          </h2>

          <div style={{
            display: 'grid',
            gap: '3rem',
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            {musicSamples.map((sample, index) => (
              <div
                key={sample.id || `music-sample-${index}`}
                className="show-card"
                style={{
                  padding: '2.5rem',
                  position: 'relative'
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

                <h3
                  style={{
                    fontFamily: 'Libre Baskerville, serif',
                    fontSize: '1.8rem',
                    fontWeight: 600,
                    marginBottom: '1rem',
                    color: 'var(--moonlight)'
                  }}
                >
                  {sample.title}
                </h3>

                <p
                  style={{
                    fontSize: '1rem',
                    lineHeight: '1.6',
                    color: 'var(--smoke)',
                    marginBottom: '2rem'
                  }}
                >
                  {sample.description}
                </p>

                {sample.type === 'video' && sample.videoUrl && (
                  <div style={{
                    position: 'relative',
                    paddingBottom: '56.25%', // 16:9 aspect ratio
                    height: 0,
                    overflow: 'hidden',
                    borderRadius: '4px',
                    marginBottom: '1.5rem'
                  }}>
                    <iframe
                      src={sample.videoUrl}
                      title={sample.title}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        border: 'none'
                      }}
                      allowFullScreen
                    />
                  </div>
                )}

                {sample.type === 'audio' && sample.audioUrl && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <a
                      href={sample.audioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ticket-button"
                      style={{
                        fontSize: '0.9rem',
                        padding: '0.6rem 1.2rem'
                      }}
                    >
                      Listen on SoundCloud
                    </a>
                  </div>
                )}

                {sample.type === 'link' && sample.linkUrl && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <a
                      href={sample.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ticket-button"
                      style={{
                        fontSize: '0.9rem',
                        padding: '0.6rem 1.2rem'
                      }}
                    >
                      {sample.linkText || 'View'}
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>

          {musicSamples.length === 0 && (
            <div style={{ textAlign: 'center', padding: '4rem 0' }}>
              <p style={{
                fontSize: '1.2rem',
                color: 'var(--smoke)',
                fontStyle: 'italic'
              }}>
                Music samples coming soon.
              </p>
            </div>
          )}
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