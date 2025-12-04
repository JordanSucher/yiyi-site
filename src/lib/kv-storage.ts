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
    // Clean up any corrupted data first
    const keys = [SETTINGS_KEY, MUSIC_SAMPLES_KEY, SHOWS_KEY]
    for (const key of keys) {
      try {
        const data = await client.get(key)
        // Only clear data if it's the problematic '[object Object]' string
        // Allow normal objects (auto-deserialized JSON) to remain
        if (data === '[object Object]') {
          console.log(`Clearing corrupted '[object Object]' data for key: ${key}`)
          await client.del(key)
        }
      } catch (error) {
        console.log(`Error checking/clearing key ${key}:`, error)
        await client.del(key)
      }
    }
    // Check if settings already exist in Redis
    const existingSettings = await client.get(SETTINGS_KEY)
    if (!existingSettings) {
      // Initialize with default settings
      const defaultSettings = getSiteSettings()
      await client.set(SETTINGS_KEY, defaultSettings)
    }

    // Check if music samples already exist in Redis
    const existingMusicSamples = await client.get(MUSIC_SAMPLES_KEY)
    if (!existingMusicSamples) {
      // Try to load from local file
      const musicSamplesPath = path.join(process.cwd(), 'content/music-samples.json')
      if (fs.existsSync(musicSamplesPath)) {
        const musicSamplesData = JSON.parse(fs.readFileSync(musicSamplesPath, 'utf8'))
        await client.set(MUSIC_SAMPLES_KEY, musicSamplesData)
      } else {
        // Initialize with empty samples
        await client.set(MUSIC_SAMPLES_KEY, { samples: [] })
      }
    }

    // Initialize shows data
    const existingShows = await client.get(SHOWS_KEY)
    if (!existingShows) {
      await client.set(SHOWS_KEY, [])
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
    if (settings) {
      console.log('Raw settings data from Redis:', typeof settings)

      // If it's already an object (Upstash auto-deserialized), return it directly
      if (typeof settings === 'object' && settings !== null) {
        return settings
      }
      // If it's a string, try to parse it
      if (typeof settings === 'string') {
        try {
          return JSON.parse(settings)
        } catch (error) {
          console.log('Failed to parse settings string, clearing corrupted data')
          await client.del(SETTINGS_KEY)
          return getSiteSettings()
        }
      }
      // If it's something else, clear it
      console.log('Unexpected settings data type, clearing...')
      await client.del(SETTINGS_KEY)
      return getSiteSettings()
    }
    return getSiteSettings()
  } catch (error) {
    console.error('Error getting settings from Redis:', error)
    // Clear corrupted data
    try {
      await client.del(SETTINGS_KEY)
    } catch (clearError) {
      console.error('Error clearing corrupted settings data:', clearError)
    }
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
    // Validate settings structure
    if (!settings || typeof settings !== 'object') {
      throw new Error('Settings must be a valid object')
    }

    console.log('Saving settings to Redis with key:', SETTINGS_KEY)

    // Store the settings directly as an object - let Upstash handle JSON serialization
    await client.set(SETTINGS_KEY, settings)
    console.log('Settings saved successfully to Redis')
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
      console.log('Raw music samples data from Redis:', typeof data, typeof data === 'object' ? 'Object' : data)

      // If it's already an object (Upstash auto-deserialized), return the samples
      if (typeof data === 'object' && data !== null) {
        const objData = data as any
        if (objData.samples && Array.isArray(objData.samples)) {
          console.log('Found object with samples array:', objData.samples.length, 'samples')
          return objData.samples
        }
      }
      // If it's a string, try to parse it
      if (typeof data === 'string') {
        try {
          const parsed = JSON.parse(data)
          return parsed.samples || []
        } catch (error) {
          console.log('Failed to parse music samples string, clearing corrupted data')
          await client.del(MUSIC_SAMPLES_KEY)
          return []
        }
      }
      // If it's something else, clear it
      console.log('Unexpected music samples data type, clearing...')
      await client.del(MUSIC_SAMPLES_KEY)
      return []
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
    // Validate data structure
    if (!data || typeof data !== 'object' || !Array.isArray(data.samples)) {
      throw new Error('Music samples data must be an object with samples array')
    }

    console.log('Saving music samples to Redis:', data.samples.length, 'samples')

    // Store the data directly as an object - let Upstash handle JSON serialization
    await client.set(MUSIC_SAMPLES_KEY, data)
    console.log('Music samples saved successfully to Redis')
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
    console.log('Getting shows from Redis with key:', SHOWS_KEY)
    const shows = await client.get(SHOWS_KEY)
    console.log('Raw shows data from Redis:', typeof shows, Array.isArray(shows) ? `Array with ${shows.length} items` : shows)

    if (shows) {
      // If it's already an array (Upstash auto-deserialized), return it directly
      if (Array.isArray(shows)) {
        return shows
      }
      // If it's a string, try to parse it
      if (typeof shows === 'string') {
        try {
          return JSON.parse(shows)
        } catch (error) {
          console.log('Failed to parse shows string, clearing corrupted data')
          await client.del(SHOWS_KEY)
          return []
        }
      }
      // If it's something else, clear it
      console.log('Unexpected shows data type, clearing...')
      await client.del(SHOWS_KEY)
      return []
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
    // Validate that shows is an array
    if (!Array.isArray(shows)) {
      throw new Error('Shows data must be an array')
    }

    console.log('Saving shows to Redis:', shows.length, 'shows with key:', SHOWS_KEY)

    // Store the shows directly as an object - let Upstash handle JSON serialization
    await client.set(SHOWS_KEY, shows)
    console.log('Shows saved successfully to Redis')
  } catch (error) {
    console.error('Error saving shows to Redis:', error)
    throw error
  }
}