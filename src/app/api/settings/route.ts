import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { getSiteSettings } from '@/lib/content'

const settingsPath = path.join(process.cwd(), 'content', 'site-settings.json')

export async function GET() {
  try {
    const settings = getSiteSettings()
    return NextResponse.json(settings)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const settingsData = await request.json()

    // Ensure content directory exists
    const contentDir = path.dirname(settingsPath)
    if (!fs.existsSync(contentDir)) {
      fs.mkdirSync(contentDir, { recursive: true })
    }

    // Write the settings file
    fs.writeFileSync(settingsPath, JSON.stringify(settingsData, null, 2), 'utf8')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}