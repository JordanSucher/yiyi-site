'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Header from './Header'

interface ClientLayoutProps {
  children: React.ReactNode
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const [settings, setSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()

  // Don't show header on admin pages
  const isAdminPage = pathname?.startsWith('/admin')

  useEffect(() => {
    if (!isAdminPage) {
      fetch('/api/settings')
        .then(res => res.json())
        .then(data => {
          setSettings(data)
          setLoading(false)
        })
        .catch(error => {
          console.error('Error loading settings:', error)
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [isAdminPage])

  if (loading && !isAdminPage) {
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
      {/* Background symbols - only on non-admin pages */}
      {!isAdminPage && (
        <>
          <div className="ritual-symbol symbol-1">⚛</div>
          <div className="ritual-symbol symbol-2">◈</div>
          <div className="ritual-symbol symbol-3">⟐</div>
          <div className="ritual-symbol symbol-4">◉</div>
          <div className="ritual-symbol symbol-5">⟢</div>
        </>
      )}

      {/* Persistent Header - only on non-admin pages */}
      {!isAdminPage && settings && (
        <Header siteTitle={settings.site.title} />
      )}

      {/* Page Content */}
      {children}
    </>
  )
}