'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Show {
  slug: string
  title: string
  date: string
  venue: string
  location: string
  ticketUrl?: string
  url?: string
  content: string
}

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

interface SiteSettings {
  site: {
    title: string
    tagline: string
    heroTitle: string
    heroDescription: string
    showsTitle: string
    contactTitle: string
    contactEmail: string
    footerText: string
  }
}

export default function Admin() {
  const [shows, setShows] = useState<Show[]>([])
  const [musicSamples, setMusicSamples] = useState<MusicSample[]>([])
  const [loading, setLoading] = useState(true)
  const [editingShow, setEditingShow] = useState<Show | null>(null)
  const [editingMusicSample, setEditingMusicSample] = useState<MusicSample | null>(null)
  const [isNewShow, setIsNewShow] = useState(false)
  const [isNewMusicSample, setIsNewMusicSample] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [activeTab, setActiveTab] = useState<'shows' | 'music' | 'settings'>('shows')
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [editingSettings, setEditingSettings] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = () => {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      router.push('/admin/login')
      return
    }

    setIsAuthenticated(true)
    fetchShows()
    fetchMusicSamples()
    fetchSettings()
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    router.push('/admin/login')
  }

  const fetchShows = async () => {
    try {
      const response = await fetch('/api/shows')
      const data = await response.json()
      setShows(data)
    } catch (error) {
      console.error('Error fetching shows:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMusicSamples = async () => {
    try {
      const response = await fetch('/api/music-samples')
      const data = await response.json()
      setMusicSamples(data)
    } catch (error) {
      console.error('Error fetching music samples:', error)
    }
  }

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings')
      const data = await response.json()
      setSettings(data)
    } catch (error) {
      console.error('Error fetching settings:', error)
    }
  }

  const handleEditShow = (show: Show) => {
    setEditingShow(show)
    setIsNewShow(false)
  }

  const handleNewShow = () => {
    setEditingShow({
      slug: '',
      title: '',
      date: '',
      venue: '',
      location: '',
      ticketUrl: '',
      url: '',
      content: ''
    })
    setIsNewShow(true)
  }

  const handleSaveShow = async (showData: Show) => {
    try {
      const method = isNewShow ? 'POST' : 'PUT'
      console.log('Saving show with method:', method, 'Data:', showData)

      const response = await fetch('/api/shows', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(showData)
      })

      console.log('Response status:', response.status)

      if (response.ok) {
        console.log('Show saved successfully')
        await fetchShows()
        setEditingShow(null)
        setIsNewShow(false)
      } else {
        const errorText = await response.text()
        console.error('Failed to save show:', response.status, errorText)
      }
    } catch (error) {
      console.error('Error saving show:', error)
    }
  }

  const handleDeleteShow = async (slug: string) => {
    if (!confirm('Are you sure you want to delete this show?')) return

    try {
      const response = await fetch(`/api/shows?slug=${slug}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchShows()
      }
    } catch (error) {
      console.error('Error deleting show:', error)
    }
  }

  // Music Sample Management Functions
  const handleNewMusicSample = () => {
    // Auto-assign the next order number
    const nextOrder = musicSamples.length > 0
      ? Math.max(...musicSamples.map(s => s.order || 0)) + 1
      : 1

    const newSample: MusicSample = {
      id: '',
      title: '',
      description: '',
      type: 'video',
      videoUrl: '',
      audioUrl: '',
      linkUrl: '',
      linkText: '',
      order: nextOrder
    }
    setEditingMusicSample(newSample)
    setIsNewMusicSample(true)
  }

  const handleEditMusicSample = (sample: MusicSample) => {
    // Ensure all fields have default values for existing samples
    const normalizedSample: MusicSample = {
      ...sample,
      linkUrl: sample.linkUrl || '',
      linkText: sample.linkText || '',
      order: sample.order || undefined
    }
    setEditingMusicSample(normalizedSample)
    setIsNewMusicSample(false)
  }

  const handleSaveMusicSample = async (sampleData: MusicSample) => {
    try {
      const method = isNewMusicSample ? 'POST' : 'PUT'
      const response = await fetch('/api/music-samples', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sampleData)
      })

      if (response.ok) {
        await fetchMusicSamples()
        setEditingMusicSample(null)
        setIsNewMusicSample(false)
      }
    } catch (error) {
      console.error('Error saving music sample:', error)
    }
  }

  const handleDeleteMusicSample = async (id: string) => {
    if (!id) {
      alert('Cannot delete sample: Invalid ID')
      return
    }

    if (!confirm('Are you sure you want to delete this music sample?')) return

    try {
      const response = await fetch(`/api/music-samples?id=${encodeURIComponent(id)}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchMusicSamples()
      } else {
        const error = await response.text()
        console.error('Delete failed:', error)
        alert('Failed to delete music sample')
      }
    } catch (error) {
      console.error('Error deleting music sample:', error)
      alert('Error deleting music sample')
    }
  }

  const handleMoveUp = async (index: number) => {
    if (index === 0) return

    const newSamples = [...musicSamples]
    const temp = newSamples[index]
    newSamples[index] = newSamples[index - 1]
    newSamples[index - 1] = temp

    await updateSampleOrder(newSamples)
  }

  const handleMoveDown = async (index: number) => {
    if (index === musicSamples.length - 1) return

    const newSamples = [...musicSamples]
    const temp = newSamples[index]
    newSamples[index] = newSamples[index + 1]
    newSamples[index + 1] = temp

    await updateSampleOrder(newSamples)
  }

  const updateSampleOrder = async (reorderedSamples: MusicSample[]) => {
    // Update order numbers based on array position
    const samplesWithNewOrder = reorderedSamples.map((sample, index) => ({
      ...sample,
      order: index + 1
    }))

    try {
      // Update each sample with new order
      for (const sample of samplesWithNewOrder) {
        await fetch('/api/music-samples', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sample)
        })
      }

      // Refresh the list
      await fetchMusicSamples()
    } catch (error) {
      console.error('Error reordering samples:', error)
      alert('Failed to reorder samples')
    }
  }

  const handleSaveSettings = async (settingsData: SiteSettings) => {
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsData)
      })

      if (response.ok) {
        setSettings(settingsData)
        setEditingSettings(false)
        alert('Settings saved successfully!')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Failed to save settings')
    }
  }

  if (!isAuthenticated || loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 sm:py-6 space-y-4 sm:space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-center">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Yi Yi Admin</h1>
              <div className="hidden sm:block ml-6 h-6 w-px bg-gray-300"></div>
              <p className="mt-1 sm:mt-0 sm:ml-6 text-sm sm:text-base text-gray-500">Content Management System</p>
            </div>
            <div className="flex items-center space-x-3 sm:space-x-6 w-full sm:w-auto">
              <Link
                href="/"
                className="inline-flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex-1 sm:flex-none justify-center sm:justify-start"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="hidden sm:inline">Back to Site</span>
                <span className="sm:hidden">Site</span>
              </Link>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors flex-1 sm:flex-none justify-center sm:justify-start"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 overflow-x-auto">
            <nav className="flex space-x-6 sm:space-x-8 min-w-max">
              <button
                onClick={() => setActiveTab('shows')}
                className={`py-3 sm:py-4 px-1 border-b-2 font-semibold text-sm whitespace-nowrap transition-colors ${
                  activeTab === 'shows'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Manage Shows
              </button>
              <button
                onClick={() => setActiveTab('music')}
                className={`py-3 sm:py-4 px-1 border-b-2 font-semibold text-sm whitespace-nowrap transition-colors ${
                  activeTab === 'music'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Manage Music
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`py-3 sm:py-4 px-1 border-b-2 font-semibold text-sm whitespace-nowrap transition-colors ${
                  activeTab === 'settings'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Site Content
              </button>
            </nav>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Shows Tab */}
        {activeTab === 'shows' && (
          <>
            {editingShow ? (
              <ShowForm
                show={editingShow}
                isNew={isNewShow}
                onSave={handleSaveShow}
                onCancel={() => setEditingShow(null)}
              />
            ) : (
              <>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 space-y-4 sm:space-y-0">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Manage Shows</h2>
                    <p className="text-sm sm:text-base text-gray-600 mt-1">Create, edit, and manage all show listings</p>
                  </div>
                  <button
                    onClick={handleNewShow}
                    className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm sm:text-base w-full sm:w-auto justify-center sm:justify-start"
                  >
                    <svg className="w-4 sm:w-5 h-4 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add New Show
                  </button>
                </div>

                {/* Desktop Table View */}
                <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Show Details
                        </th>
                        <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Date & Time
                        </th>
                        <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Venue & Location
                        </th>
                        <th className="px-8 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {shows.map((show) => (
                        <tr key={show.slug} className="hover:bg-gray-50 transition-colors">
                          <td className="px-8 py-6">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 w-3 h-3 bg-blue-400 rounded-full mr-3"></div>
                              <div>
                                <div className="text-sm font-semibold text-gray-900">
                                  {show.title}
                                </div>
                                {show.ticketUrl && (
                                  <div className="text-xs text-green-600 mt-1">Tickets Available</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="text-sm text-gray-900 font-medium">
                              {new Date(show.date).toLocaleDateString('en-US', {
                                weekday: 'short',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {new Date(show.date).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit'
                              })}
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="text-sm font-medium text-gray-900">
                              {show.venue}
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              {show.location}
                            </div>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <div className="flex items-center justify-end space-x-3">
                              <button
                                onClick={() => handleEditShow(show)}
                                className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                              >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteShow(show.slug)}
                                className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                              >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {shows.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-8 py-12 text-center">
                            <div className="flex flex-col items-center">
                              <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                              </svg>
                              <p className="text-gray-500 text-lg font-medium mb-2">No shows yet</p>
                              <p className="text-gray-400 text-sm">Create your first show to get started</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden space-y-4">
                  {shows.map((show) => (
                    <div key={show.slug} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 w-3 h-3 bg-blue-400 rounded-full mr-2"></div>
                          <h3 className="text-base font-semibold text-gray-900">{show.title}</h3>
                        </div>
                        {show.ticketUrl && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Tickets
                          </span>
                        )}
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {new Date(show.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })} at {new Date(show.date).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit'
                          })}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <div>
                            <span className="font-medium">{show.venue}</span>
                            <span className="text-gray-500 ml-1">• {show.location}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleEditShow(show)}
                          className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteShow(show.slug)}
                          className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}

                  {shows.length === 0 && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                      <svg className="w-12 h-12 text-gray-400 mb-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <p className="text-gray-500 text-lg font-medium mb-2">No shows yet</p>
                      <p className="text-gray-400 text-sm">Create your first show to get started</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}

        {/* Music Tab */}
        {activeTab === 'music' && (
          <>
            {editingMusicSample ? (
              <MusicSampleForm
                musicSample={editingMusicSample}
                isNew={isNewMusicSample}
                onSave={handleSaveMusicSample}
                onCancel={() => {
                  setEditingMusicSample(null)
                  setIsNewMusicSample(false)
                }}
              />
            ) : (
              <>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 space-y-4 sm:space-y-0">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Manage Music Samples</h2>
                    <p className="text-sm sm:text-base text-gray-600 mt-1">Add and manage videos, audio links, and music content</p>
                  </div>
                  <button
                    onClick={handleNewMusicSample}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors w-full sm:w-auto justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Music Sample
                  </button>
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Reorder</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">URL</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {musicSamples.map((sample, index) => (
                        <tr key={sample.id || `sample-${index}`} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center space-x-1">
                              <button
                                onClick={() => handleMoveUp(index)}
                                disabled={index === 0}
                                className={`p-1 rounded ${
                                  index === 0
                                    ? 'text-gray-300 cursor-not-allowed'
                                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                                }`}
                                title="Move up"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleMoveDown(index)}
                                disabled={index === musicSamples.length - 1}
                                className={`p-1 rounded ${
                                  index === musicSamples.length - 1
                                    ? 'text-gray-300 cursor-not-allowed'
                                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                                }`}
                                title="Move down"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{sample.title}</div>
                              <div className="text-sm text-gray-500">{sample.description}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 capitalize">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              sample.type === 'video'
                                ? 'bg-purple-100 text-purple-800'
                                : sample.type === 'audio'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {sample.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {sample.videoUrl && (
                              <a href={sample.videoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                                Video Link
                              </a>
                            )}
                            {sample.audioUrl && (
                              <a href={sample.audioUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                                Audio Link
                              </a>
                            )}
                            {sample.linkUrl && (
                              <a href={sample.linkUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                                {sample.linkText || 'Link'}
                              </a>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium space-x-2">
                            <button
                              onClick={() => handleEditMusicSample(sample)}
                              className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteMusicSample(sample.id)}
                              className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                      {musicSamples.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-8 py-12 text-center">
                            <div className="flex flex-col items-center">
                              <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                              </svg>
                              <h3 className="text-lg font-medium text-gray-900 mb-2">No Music Samples</h3>
                              <p className="text-gray-500 mb-4">Get started by adding your first music sample.</p>
                              <button
                                onClick={handleNewMusicSample}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                              >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Add Music Sample
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                  {musicSamples.map((sample, index) => (
                    <div key={sample.id || `mobile-sample-${index}`} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-semibold text-gray-900 truncate">{sample.title}</h3>
                          <p className="text-sm text-gray-500 mt-1">{sample.description}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            {sample.order && (
                              <span className="text-xs text-gray-400">Order: {sample.order}</span>
                            )}
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              sample.type === 'video'
                                ? 'bg-purple-100 text-purple-800'
                                : sample.type === 'audio'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {sample.type}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="mb-3">
                        {sample.videoUrl && (
                          <a href={sample.videoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-sm">
                            Video Link →
                          </a>
                        )}
                        {sample.audioUrl && (
                          <a href={sample.audioUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-sm">
                            Audio Link →
                          </a>
                        )}
                        {sample.linkUrl && (
                          <a href={sample.linkUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-sm">
                            {sample.linkText || 'Link'} →
                          </a>
                        )}
                      </div>
                      <div className="flex flex-col space-y-2">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleMoveUp(index)}
                            disabled={index === 0}
                            className={`flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                              index === 0
                                ? 'text-gray-300 cursor-not-allowed bg-gray-100'
                                : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                            }`}
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                            Move Up
                          </button>
                          <button
                            onClick={() => handleMoveDown(index)}
                            disabled={index === musicSamples.length - 1}
                            className={`flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                              index === musicSamples.length - 1
                                ? 'text-gray-300 cursor-not-allowed bg-gray-100'
                                : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                            }`}
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                            Move Down
                          </button>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditMusicSample(sample)}
                            className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteMusicSample(sample.id)}
                            className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {musicSamples.length === 0 && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                      <svg className="w-12 h-12 text-gray-400 mb-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                      </svg>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Music Samples</h3>
                      <p className="text-gray-500 mb-4">Get started by adding your first music sample.</p>
                      <button
                        onClick={handleNewMusicSample}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Music Sample
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && settings && (
          <>
            {editingSettings ? (
              <SettingsForm
                settings={settings}
                onSave={handleSaveSettings}
                onCancel={() => setEditingSettings(false)}
              />
            ) : (
              <>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 space-y-4 sm:space-y-0">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Site Content</h2>
                    <p className="text-sm sm:text-base text-gray-600 mt-1">Manage your website content and information</p>
                  </div>
                  <button
                    onClick={() => setEditingSettings(true)}
                    className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm sm:text-base w-full sm:w-auto justify-center sm:justify-start"
                  >
                    <svg className="w-4 sm:w-5 h-4 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Site Content
                  </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                  <div className="p-4 sm:p-6 lg:p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                      <div className="p-6 bg-gray-50 rounded-lg">
                        <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">Site Identity</h3>
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-1">Site Title</h4>
                            <p className="text-base font-medium text-gray-900">{settings.site.title}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-1">Tagline</h4>
                            <p className="text-base text-gray-600">{settings.site.tagline}</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-6 bg-gray-50 rounded-lg">
                        <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">Contact Information</h3>
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-1">Contact Email</h4>
                            <p className="text-base text-gray-900">{settings.site.contactEmail}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-1">Footer Text</h4>
                            <p className="text-sm text-gray-600">{settings.site.footerText}</p>
                          </div>
                        </div>
                      </div>

                      <div className="lg:col-span-2 p-6 bg-blue-50 rounded-lg border border-blue-200">
                        <h3 className="text-sm font-semibold text-blue-700 mb-3 uppercase tracking-wide">Homepage Content</h3>
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Hero Title</h4>
                            <p className="text-lg font-medium text-gray-900">{settings.site.heroTitle}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Hero Description</h4>
                            <p className="text-sm text-gray-700 leading-relaxed">{settings.site.heroDescription}</p>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// Music Sample Form Component
interface MusicSampleFormProps {
  musicSample: MusicSample
  isNew: boolean
  onSave: (sample: MusicSample) => void
  onCancel: () => void
}

function MusicSampleForm({ musicSample, isNew, onSave, onCancel }: MusicSampleFormProps) {
  const [formData, setFormData] = useState(musicSample)

  // Update form data when musicSample prop changes
  useEffect(() => {
    setFormData(musicSample)
  }, [musicSample])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  const updateField = (field: keyof MusicSample, value: string) => {
    const processedValue = field === 'order'
      ? (value === '' ? undefined : parseInt(value, 10))
      : value
    setFormData(prev => ({ ...prev, [field]: processedValue }))
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">
        {isNew ? 'Add New Music Sample' : 'Edit Music Sample'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type *
            </label>
            <select
              value={formData.type}
              onChange={(e) => updateField('type', e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              required
            >
              <option value="video">Video</option>
              <option value="audio">Audio</option>
              <option value="link">Link</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => updateField('description', e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            rows={3}
          />
        </div>

        {formData.type === 'video' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Video URL (YouTube)
            </label>
            <input
              type="url"
              value={formData.videoUrl || ''}
              onChange={(e) => updateField('videoUrl', e.target.value)}
              placeholder="https://www.youtube.com/watch?v=VIDEO_ID or https://youtu.be/VIDEO_ID"
              className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Paste any YouTube URL - it will be automatically converted to the correct embed format
            </p>
          </div>
        )}

        {formData.type === 'audio' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Audio URL (SoundCloud, Spotify, etc.)
            </label>
            <input
              type="url"
              value={formData.audioUrl || ''}
              onChange={(e) => updateField('audioUrl', e.target.value)}
              placeholder="https://soundcloud.com/your-track"
              className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        )}

        {formData.type === 'link' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Link URL *
              </label>
              <input
                type="url"
                value={formData.linkUrl || ''}
                onChange={(e) => updateField('linkUrl', e.target.value)}
                placeholder="https://example.com"
                className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Link Text (optional)
              </label>
              <input
                type="text"
                value={formData.linkText || ''}
                onChange={(e) => updateField('linkText', e.target.value)}
                placeholder="View, Listen, Download, etc."
                className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            {isNew ? 'Add Music Sample' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}

// Show Form Component
interface ShowFormProps {
  show: Show
  isNew: boolean
  onSave: (show: Show) => void
  onCancel: () => void
}

function ShowForm({ show, isNew, onSave, onCancel }: ShowFormProps) {
  const [formData, setFormData] = useState(show)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Generate slug from title and date if new
    if (isNew && !formData.slug) {
      const dateStr = new Date(formData.date).toISOString().split('T')[0]
      const titleSlug = formData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
      setFormData(prev => ({ ...prev, slug: `${dateStr}-${titleSlug}` }))
    }

    onSave(formData)
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">
        {isNew ? 'Add New Show' : 'Edit Show'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Show Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date & Time
          </label>
          <input
            type="datetime-local"
            value={formData.date ? formData.date.slice(0, 16) : ''}
            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value + ':00.000Z' }))}
            className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Venue
          </label>
          <input
            type="text"
            value={formData.venue}
            onChange={(e) => setFormData(prev => ({ ...prev, venue: e.target.value }))}
            className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="City, State"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ticket URL (optional)
          </label>
          <input
            type="url"
            value={formData.ticketUrl || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, ticketUrl: e.target.value }))}
            className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="https://example.com/tickets"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Show URL (optional)
          </label>
          <input
            type="url"
            value={formData.url || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
            className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="https://example.com/show-info"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description (optional)
          </label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
            className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            rows={3}
            placeholder="Additional details about the show..."
          />
        </div>

        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 w-full sm:w-auto"
          >
            {isNew ? 'Add Show' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400 w-full sm:w-auto"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

// Settings Form Component
interface SettingsFormProps {
  settings: SiteSettings
  onSave: (settings: SiteSettings) => void
  onCancel: () => void
}

function SettingsForm({ settings, onSave, onCancel }: SettingsFormProps) {
  const [formData, setFormData] = useState(settings)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  const updateSite = (field: keyof SiteSettings['site'], value: string) => {
    setFormData(prev => ({
      ...prev,
      site: {
        ...prev.site,
        [field]: value
      }
    }))
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Edit Site Content</h2>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Site Title
            </label>
            <input
              type="text"
              value={formData.site.title}
              onChange={(e) => updateSite('title', e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tagline
            </label>
            <input
              type="text"
              value={formData.site.tagline}
              onChange={(e) => updateSite('tagline', e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hero Title
          </label>
          <input
            type="text"
            value={formData.site.heroTitle}
            onChange={(e) => updateSite('heroTitle', e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hero Description
          </label>
          <textarea
            value={formData.site.heroDescription}
            onChange={(e) => updateSite('heroDescription', e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            rows={4}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Shows Section Title
            </label>
            <input
              type="text"
              value={formData.site.showsTitle}
              onChange={(e) => updateSite('showsTitle', e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Section Title
            </label>
            <input
              type="text"
              value={formData.site.contactTitle}
              onChange={(e) => updateSite('contactTitle', e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Email
            </label>
            <input
              type="email"
              value={formData.site.contactEmail}
              onChange={(e) => updateSite('contactEmail', e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Footer Text
            </label>
            <input
              type="text"
              value={formData.site.footerText}
              onChange={(e) => updateSite('footerText', e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 w-full sm:w-auto"
          >
            Save Changes
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400 w-full sm:w-auto"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}