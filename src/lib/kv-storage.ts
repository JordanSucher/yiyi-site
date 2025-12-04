import { Redis } from '@upstash/redis'
import fs from 'fs'
import path from 'path'
import { getSiteSettings } from './content'

// Initialize Redis client
let redis: Redis | null = null

function getRedis() {
  if (!redis && process.env.NODE_ENV === 'production') {
    // Try multiple possible environment variable names
    const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || process.env.REDIS_URL
    const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN

    if (url && token) {
      redis = new Redis({
        url,
        token,
      })
    }
  }
  return redis
}

// Keys for storing data in KV
const SETTINGS_KEY = 'site:settings'
const MUSIC_SAMPLES_KEY = 'site:music-samples'
const SHOWS_KEY = 'site:shows'

// Initialize Redis with local file data (only run once)
export async function initializeRedis() {
  if (process.env.NODE_ENV !== 'production') {
    // In development, don't use Redis - use local files
    return
  }

  const client = getRedis()
  if (!client) {
    console.log('Redis not configured - skipping initialization')
    return
  }

  try {
    // Check if settings already exist in Redis
    const existingSettings = await client.get(SETTINGS_KEY)
    if (!existingSettings) {
      // Initialize with default settings
      const defaultSettings = getSiteSettings()
      await client.set(SETTINGS_KEY, JSON.stringify(defaultSettings))
    }

    // Check if music samples already exist in Redis
    const existingMusicSamples = await client.get(MUSIC_SAMPLES_KEY)
    if (!existingMusicSamples) {
      // Try to load from local file
      const musicSamplesPath = path.join(process.cwd(), 'content/music-samples.json')
      if (fs.existsSync(musicSamplesPath)) {
        const musicSamplesData = JSON.parse(fs.readFileSync(musicSamplesPath, 'utf8'))
        await client.set(MUSIC_SAMPLES_KEY, JSON.stringify(musicSamplesData))
      } else {
        // Initialize with empty samples
        await client.set(MUSIC_SAMPLES_KEY, JSON.stringify({ samples: [] }))
      }
    }

    // Initialize shows data
    const existingShows = await client.get(SHOWS_KEY)
    if (!existingShows) {
      await client.set(SHOWS_KEY, JSON.stringify([]))
    }
  } catch (error) {
    console.log('Redis initialization skipped:', error instanceof Error ? error.message : String(error))
  }
}

// Settings functions
export async function getSettingsFromRedis() {
  if (process.env.NODE_ENV !== 'production') {
    return getSiteSettings()
  }

  const client = getRedis()
  if (!client) {
    return getSiteSettings()
  }

  try {
    const settings = await client.get(SETTINGS_KEY)
    return settings ? JSON.parse(settings as string) : getSiteSettings()
  } catch (error) {
    console.error('Error getting settings from Redis:', error)
    return getSiteSettings()
  }
}

export async function saveSettingsToRedis(settings: any) {
  if (process.env.NODE_ENV !== 'production') {
    // In development, save to local file
    const settingsPath = path.join(process.cwd(), 'content', 'site-settings.json')
    const contentDir = path.dirname(settingsPath)
    if (!fs.existsSync(contentDir)) {
      fs.mkdirSync(contentDir, { recursive: true })
    }
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf8')
    return
  }

  const client = getRedis()
  if (!client) {
    throw new Error('Redis not configured')
  }

  try {
    await client.set(SETTINGS_KEY, JSON.stringify(settings))
  } catch (error) {
    console.error('Error saving settings to Redis:', error)
    throw error
  }
}

// Music samples functions
export async function getMusicSamplesFromRedis() {
  if (process.env.NODE_ENV !== 'production') {
    const musicSamplesPath = path.join(process.cwd(), 'content/music-samples.json')
    if (fs.existsSync(musicSamplesPath)) {
      const data = fs.readFileSync(musicSamplesPath, 'utf8')
      const musicSamples = JSON.parse(data)
      return musicSamples.samples || []
    }
    return []
  }

  const client = getRedis()
  if (!client) {
    return []
  }

  try {
    const data = await client.get(MUSIC_SAMPLES_KEY)
    if (data) {
      console.log('Raw data from Redis:', typeof data, data)
      // If data is corrupted, clear it and return empty
      if (data === '[object Object]' || typeof data === 'object') {
        console.log('Corrupted data detected, clearing...')
        await client.del(MUSIC_SAMPLES_KEY)
        return []
      }
      const parsed = JSON.parse(data as string)
      return parsed.samples || []
    }
    return []
  } catch (error) {
    console.error('Error getting music samples from Redis:', error)
    // Clear corrupted data
    try {
      await client.del(MUSIC_SAMPLES_KEY)
    } catch (clearError) {
      console.error('Error clearing corrupted data:', clearError)
    }
    return []
  }
}

export async function saveMusicSamplesToRedis(samples: any[]) {
  const data = { samples }

  if (process.env.NODE_ENV !== 'production') {
    // In development, save to local file
    const musicSamplesPath = path.join(process.cwd(), 'content/music-samples.json')
    const contentDir = path.dirname(musicSamplesPath)
    if (!fs.existsSync(contentDir)) {
      fs.mkdirSync(contentDir, { recursive: true })
    }
    fs.writeFileSync(musicSamplesPath, JSON.stringify(data, null, 2), 'utf8')
    return
  }

  const client = getRedis()
  if (!client) {
    throw new Error('Redis not configured')
  }

  try {
    await client.set(MUSIC_SAMPLES_KEY, JSON.stringify(data))
  } catch (error) {
    console.error('Error saving music samples to Redis:', error)
    throw error
  }
}

// Shows functions
export async function getShowsFromRedis() {
  if (process.env.NODE_ENV !== 'production') {
    // In development, use file-based shows
    const { getAllShows } = require('./content')
    return getAllShows()
  }

  const client = getRedis()
  if (!client) {
    return []
  }

  try {
    const shows = await client.get(SHOWS_KEY)
    if (shows) {
      // If data is corrupted, clear it and return empty
      if (shows === '[object Object]' || typeof shows === 'object') {
        console.log('Corrupted shows data detected, clearing...')
        await client.del(SHOWS_KEY)
        return []
      }
      return JSON.parse(shows as string)
    }
    return []
  } catch (error) {
    console.error('Error getting shows from Redis:', error)
    // Clear corrupted data
    try {
      await client.del(SHOWS_KEY)
    } catch (clearError) {
      console.error('Error clearing corrupted shows data:', clearError)
    }
    return []
  }
}

export async function saveShowsToRedis(shows: any[]) {
  if (process.env.NODE_ENV !== 'production') {
    // In development, shows are file-based - don't save to Redis
    return
  }

  const client = getRedis()
  if (!client) {
    throw new Error('Redis not configured')
  }

  try {
    await client.set(SHOWS_KEY, JSON.stringify(shows))
  } catch (error) {
    console.error('Error saving shows to Redis:', error)
    throw error
  }
}