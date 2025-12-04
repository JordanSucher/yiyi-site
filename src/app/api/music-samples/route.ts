import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const MUSIC_SAMPLES_FILE = path.join(process.cwd(), 'content/music-samples.json')

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

// Helper function to ensure file exists
function ensureMusicSamplesFile() {
  if (!fs.existsSync(MUSIC_SAMPLES_FILE)) {
    const initialData = { samples: [] }
    fs.writeFileSync(MUSIC_SAMPLES_FILE, JSON.stringify(initialData, null, 2))
  }
}

// GET - Retrieve all music samples
export async function GET() {
  try {
    ensureMusicSamplesFile()
    const data = fs.readFileSync(MUSIC_SAMPLES_FILE, 'utf8')
    const musicSamples = JSON.parse(data)
    const samples = musicSamples.samples || []

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

    ensureMusicSamplesFile()
    const data = fs.readFileSync(MUSIC_SAMPLES_FILE, 'utf8')
    const musicSamples = JSON.parse(data)

    // Generate ID based on title with fallback
    let id = sample.title ? sample.title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') : ''

    // If ID is empty or too short, generate a unique one
    if (!id || id.length < 1) {
      id = `sample-${Date.now()}`
    }

    // Check for duplicates and append number if needed
    const existingSamples = musicSamples.samples || []
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
      const existingOrders = (musicSamples.samples || []).map((s: MusicSample) => s.order).filter(Boolean)
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

    musicSamples.samples = musicSamples.samples || []
    musicSamples.samples.push(newSample)

    fs.writeFileSync(MUSIC_SAMPLES_FILE, JSON.stringify(musicSamples, null, 2))

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

    ensureMusicSamplesFile()
    const data = fs.readFileSync(MUSIC_SAMPLES_FILE, 'utf8')
    const musicSamples = JSON.parse(data)

    const index = musicSamples.samples.findIndex((s: MusicSample) => s.id === updatedSample.id)
    if (index === -1) {
      return NextResponse.json({ error: 'Music sample not found' }, { status: 404 })
    }

    musicSamples.samples[index] = updatedSample

    fs.writeFileSync(MUSIC_SAMPLES_FILE, JSON.stringify(musicSamples, null, 2))

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

    ensureMusicSamplesFile()
    const data = fs.readFileSync(MUSIC_SAMPLES_FILE, 'utf8')
    const musicSamples = JSON.parse(data)

    musicSamples.samples = musicSamples.samples.filter((s: MusicSample) => s.id !== id)

    fs.writeFileSync(MUSIC_SAMPLES_FILE, JSON.stringify(musicSamples, null, 2))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting music sample:', error)
    return NextResponse.json({ error: 'Failed to delete music sample' }, { status: 500 })
  }
}