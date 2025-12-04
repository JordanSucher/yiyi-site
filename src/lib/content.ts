import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const contentDirectory = path.join(process.cwd(), 'content')

export interface Show {
  slug: string
  title: string
  date: string
  venue: string
  location: string
  ticketUrl?: string
  url?: string
  content: string
}

export interface Page {
  slug: string
  title: string
  content: string
}

export interface SiteSettings {
  site: {
    title: string
    tagline: string
    heroTitle: string
    heroDescription: string
    aboutTitle: string
    aboutContent: string
    showsTitle: string
    contactTitle: string
    contactEmail: string
    footerText: string
  }
}

export function getAllShows(): Show[] {
  const showsDirectory = path.join(contentDirectory, 'shows')

  if (!fs.existsSync(showsDirectory)) {
    return []
  }

  const filenames = fs.readdirSync(showsDirectory)
  const shows = filenames
    .filter((name) => name.endsWith('.mdx') || name.endsWith('.md'))
    .map((filename) => {
      const filePath = path.join(showsDirectory, filename)
      const fileContents = fs.readFileSync(filePath, 'utf8')
      const { data, content } = matter(fileContents)

      return {
        slug: filename.replace(/\.mdx?$/, ''),
        title: data.title || '',
        date: data.date || '',
        venue: data.venue || '',
        location: data.location || '',
        ticketUrl: data.ticketUrl,
        url: data.url,
        content,
      }
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return shows
}

export function getPage(slug: string): Page | null {
  const pagesDirectory = path.join(contentDirectory, 'pages')
  const filePath = path.join(pagesDirectory, `${slug}.mdx`)

  if (!fs.existsSync(filePath)) {
    return null
  }

  const fileContents = fs.readFileSync(filePath, 'utf8')
  const { data, content } = matter(fileContents)

  return {
    slug,
    title: data.title || '',
    content,
  }
}

export function getSiteSettings(): SiteSettings {
  const settingsPath = path.join(contentDirectory, 'site-settings.json')

  if (!fs.existsSync(settingsPath)) {
    // Return default settings if file doesn't exist
    return {
      site: {
        title: 'yi yi',
        tagline: 'village polyphony',
        heroTitle: 'Dissonant harmonies from the village, refracted through Brooklyn',
        heroDescription: 'Three women excavating the raw polyphonic traditions of rural Ukraine—the kind of singing that uses chest voice like a weapon, where intervals clash on purpose, where "beautiful" was never the point. We\'re not here to make folk music palatable.',
        aboutTitle: 'The Circle',
        aboutContent: 'Yi Yi practices what ethnomusicologists call "white voice" singing (bilyi holos)—an open-throat, chest-register technique that\'s been passed down in Ukrainian villages for centuries, sounding nothing like the trained voices you hear on opera stages.',
        showsTitle: 'Gatherings',
        contactTitle: 'Join the Circle',
        contactEmail: 'hello@yiyifolk.com',
        footerText: 'yi yi • woven in brooklyn • 2024'
      }
    }
  }

  const fileContents = fs.readFileSync(settingsPath, 'utf8')
  return JSON.parse(fileContents) as SiteSettings
}