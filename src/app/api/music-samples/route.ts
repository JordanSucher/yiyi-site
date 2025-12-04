import { NextRequest, NextResponse } from 'next/server'
import { getMusicSamplesFromRedis, saveMusicSamplesToRedis, initializeRedis } from '@/lib/kv-storage'

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

// Helper function to extract YouTube video ID from various URL formats
function extractYouTubeVideoId(url: string): string | null {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/
  const match = url.match(regExp)
  return (match && match[7].length === 11) ? match[7] : null
}

// GET - Retrieve all music samples
export async function GET() {
  try {
    await initializeRedis()
    const samples = await getMusicSamplesFromRedis()

    // Sort by order, then by title if no order specified
    samples.sort((a: MusicSample, b: MusicSample) => {
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order
      }
      if (a.order !== undefined) return -1
      if (b.order !== undefined) return 1
      return a.title.localeCompare(b.title)
    })

    return NextResponse.json(samples)
  } catch (error) {
    console.error('Error reading music samples:', error)
    return NextResponse.json({ error: 'Failed to read music samples' }, { status: 500 })
  }
}

// POST - Create new music sample
export async function POST(request: NextRequest) {
  try {
    const sampleData: any = await request.json()

    // Remove any existing id field to ensure we generate a new one
    const { id: _, ...sample } = sampleData

    const existingSamples = await getMusicSamplesFromRedis()

    // Generate ID based on title with fallback
    let id = sample.title ? sample.title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') : ''

    // If ID is empty or too short, generate a unique one
    if (!id || id.length < 1) {
      id = `sample-${Date.now()}`
    }

    // Check for duplicates and append number if needed
    let uniqueId = id
    let counter = 1
    while (existingSamples.some((s: MusicSample) => s.id === uniqueId)) {
      uniqueId = `${id}-${counter}`
      counter++
    }

    // Convert YouTube URLs to embed format
    if (sample.videoUrl && (sample.videoUrl.includes('youtube.com') || sample.videoUrl.includes('youtu.be'))) {
      const videoId = extractYouTubeVideoId(sample.videoUrl)
      if (videoId) {
        sample.videoUrl = `https://www.youtube.com/embed/${videoId}`
      }
    }

    // Ensure order is unique if specified
    if (sample.order !== undefined && sample.order !== null) {
      const existingOrders = existingSamples.map((s: MusicSample) => s.order).filter(Boolean)
      if (existingOrders.includes(sample.order)) {
        // Find the next available order number
        let nextOrder = sample.order
        while (existingOrders.includes(nextOrder)) {
          nextOrder++
        }
        sample.order = nextOrder
      }
    }

    const newSample: MusicSample = {
      id: uniqueId,
      ...sample
    }

    const updatedSamples = [...existingSamples, newSample]
    await saveMusicSamplesToRedis(updatedSamples)

    return NextResponse.json(newSample, { status: 201 })
  } catch (error) {
    console.error('Error creating music sample:', error)
    return NextResponse.json({ error: 'Failed to create music sample' }, { status: 500 })
  }
}

// PUT - Update existing music sample
export async function PUT(request: NextRequest) {
  try {
    const updatedSample: MusicSample = await request.json()

    // Convert YouTube URLs to embed format
    if (updatedSample.videoUrl && (updatedSample.videoUrl.includes('youtube.com') || updatedSample.videoUrl.includes('youtu.be'))) {
      const videoId = extractYouTubeVideoId(updatedSample.videoUrl)
      if (videoId) {
        updatedSample.videoUrl = `https://www.youtube.com/embed/${videoId}`
      }
    }

    const existingSamples = await getMusicSamplesFromRedis()
    const index = existingSamples.findIndex((s: MusicSample) => s.id === updatedSample.id)
    if (index === -1) {
      return NextResponse.json({ error: 'Music sample not found' }, { status: 404 })
    }

    existingSamples[index] = updatedSample
    await saveMusicSamplesToRedis(existingSamples)

    return NextResponse.json(updatedSample)
  } catch (error) {
    console.error('Error updating music sample:', error)
    return NextResponse.json({ error: 'Failed to update music sample' }, { status: 500 })
  }
}

// DELETE - Remove music sample
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Music sample ID required' }, { status: 400 })
    }

    const existingSamples = await getMusicSamplesFromRedis()
    const updatedSamples = existingSamples.filter((s: MusicSample) => s.id !== id)
    await saveMusicSamplesToRedis(updatedSamples)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting music sample:', error)
    return NextResponse.json({ error: 'Failed to delete music sample' }, { status: 500 })
  }
}