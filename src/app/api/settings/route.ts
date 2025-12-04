import { NextResponse } from 'next/server'
import { getSettingsFromRedis, saveSettingsToRedis, initializeRedis } from '@/lib/kv-storage'

export async function GET() {
  try {
    await initializeRedis()
    const settings = await getSettingsFromRedis()
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const settingsData = await request.json()
    await saveSettingsToRedis(settingsData)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}