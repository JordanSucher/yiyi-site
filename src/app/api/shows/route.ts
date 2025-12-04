import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { getShowsFromRedis, saveShowsToRedis, initializeRedis } from '@/lib/kv-storage'

const contentDirectory = path.join(process.cwd(), 'content', 'shows')

export async function GET() {
  try {
    await initializeRedis()
    const shows = await getShowsFromRedis()
    console.log('Shows retrieved:', shows.length, 'shows')
    return NextResponse.json(shows)
  } catch (error) {
    console.error('Error fetching shows:', error)
    return NextResponse.json({ error: 'Failed to fetch shows' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const showData = await request.json()

    // Generate slug from title and date if not provided
    if (!showData.slug) {
      const dateStr = new Date(showData.date).toISOString().split('T')[0]
      const titleSlug = showData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
      showData.slug = `${dateStr}-${titleSlug}`
    }

    if (process.env.NODE_ENV === 'production') {
      // In production, store in KV as show object
      const newShow = {
        slug: showData.slug,
        title: showData.title,
        date: showData.date,
        venue: showData.venue,
        location: showData.location,
        content: showData.content || '',
        ...(showData.ticketUrl && { ticketUrl: showData.ticketUrl }),
        ...(showData.url && { url: showData.url })
      }

      const existingShows = await getShowsFromRedis()
      console.log('Existing shows before adding:', existingShows.length)
      const updatedShows = [...existingShows, newShow]
      await saveShowsToRedis(updatedShows)
      console.log('Show saved. Total shows now:', updatedShows.length)
    } else {
      // In development, save to file
      const frontmatter = {
        title: showData.title,
        date: showData.date,
        venue: showData.venue,
        location: showData.location,
        ...(showData.ticketUrl && { ticketUrl: showData.ticketUrl }),
        ...(showData.url && { url: showData.url })
      }

      const fileContent = matter.stringify(showData.content || '', frontmatter)

      // Ensure directory exists
      if (!fs.existsSync(contentDirectory)) {
        fs.mkdirSync(contentDirectory, { recursive: true })
      }

      // Write the file
      const filePath = path.join(contentDirectory, `${showData.slug}.mdx`)
      fs.writeFileSync(filePath, fileContent, 'utf8')
    }

    return NextResponse.json({ success: true, slug: showData.slug })
  } catch (error) {
    console.error('Error creating show:', error)
    return NextResponse.json({ error: 'Failed to create show' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const showData = await request.json()

    if (process.env.NODE_ENV === 'production') {
      // In production, update in KV
      const existingShows = await getShowsFromRedis()
      const index = existingShows.findIndex((show: any) => show.slug === showData.slug)

      if (index === -1) {
        return NextResponse.json({ error: 'Show not found' }, { status: 404 })
      }

      const updatedShow = {
        slug: showData.slug,
        title: showData.title,
        date: showData.date,
        venue: showData.venue,
        location: showData.location,
        content: showData.content || '',
        ...(showData.ticketUrl && { ticketUrl: showData.ticketUrl }),
        ...(showData.url && { url: showData.url })
      }

      existingShows[index] = updatedShow
      await saveShowsToRedis(existingShows)
    } else {
      // In development, update file
      const frontmatter = {
        title: showData.title,
        date: showData.date,
        venue: showData.venue,
        location: showData.location,
        ...(showData.ticketUrl && { ticketUrl: showData.ticketUrl }),
        ...(showData.url && { url: showData.url })
      }

      const fileContent = matter.stringify(showData.content || '', frontmatter)
      const filePath = path.join(contentDirectory, `${showData.slug}.mdx`)
      fs.writeFileSync(filePath, fileContent, 'utf8')
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating show:', error)
    return NextResponse.json({ error: 'Failed to update show' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')

    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 })
    }

    if (process.env.NODE_ENV === 'production') {
      // In production, remove from KV
      const existingShows = await getShowsFromRedis()
      const updatedShows = existingShows.filter((show: any) => show.slug !== slug)
      await saveShowsToRedis(updatedShows)
    } else {
      // In development, delete file
      const filePath = path.join(contentDirectory, `${slug}.mdx`)
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      } else {
        return NextResponse.json({ error: 'Show not found' }, { status: 404 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting show:', error)
    return NextResponse.json({ error: 'Failed to delete show' }, { status: 500 })
  }
}