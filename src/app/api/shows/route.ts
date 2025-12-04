import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { getAllShows } from '@/lib/content'

const contentDirectory = path.join(process.cwd(), 'content', 'shows')

export async function GET() {
  try {
    const shows = getAllShows()
    return NextResponse.json(shows)
  } catch (error) {
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

    // Create the frontmatter content
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

    return NextResponse.json({ success: true, slug: showData.slug })
  } catch (error) {
    console.error('Error creating show:', error)
    return NextResponse.json({ error: 'Failed to create show' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const showData = await request.json()

    // Create the frontmatter content
    const frontmatter = {
      title: showData.title,
      date: showData.date,
      venue: showData.venue,
      location: showData.location,
      ...(showData.ticketUrl && { ticketUrl: showData.ticketUrl }),
      ...(showData.url && { url: showData.url })
    }

    const fileContent = matter.stringify(showData.content || '', frontmatter)

    // Write the file
    const filePath = path.join(contentDirectory, `${showData.slug}.mdx`)
    fs.writeFileSync(filePath, fileContent, 'utf8')

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

    const filePath = path.join(contentDirectory, `${slug}.mdx`)

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: 'Show not found' }, { status: 404 })
    }
  } catch (error) {
    console.error('Error deleting show:', error)
    return NextResponse.json({ error: 'Failed to delete show' }, { status: 500 })
  }
}