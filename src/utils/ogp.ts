export interface OGPData {
  title?: string
  description?: string
  image?: string
  siteName?: string
}

function extractMeta(html: string, property: string): string | undefined {
  // og: property
  const ogMatch = html.match(
    new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']*)["']`, 'i')
  ) ?? html.match(
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+property=["']${property}["']`, 'i')
  )
  if (ogMatch?.[1]) return ogMatch[1]

  // name= fallback for description
  if (property === 'og:description') {
    const nameMatch = html.match(
      /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i
    ) ?? html.match(
      /<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i
    )
    if (nameMatch?.[1]) return nameMatch[1]
  }

  return undefined
}

function extractTitle(html: string): string | undefined {
  const match = html.match(/<title[^>]*>([^<]*)<\/title>/i)
  return match?.[1]?.trim()
}

export async function fetchOGP(url: string): Promise<OGPData> {
  const proxyUrl = `https://api.allorigins.win/get?disableCache=true&url=${encodeURIComponent(url)}`
  const res = await fetch(proxyUrl)
  if (!res.ok) throw new Error('fetch failed')
  const json = await res.json() as { contents: string }
  const html = json.contents

  const ogTitle = extractMeta(html, 'og:title') ?? extractTitle(html)
  const ogDescription = extractMeta(html, 'og:description')
  const ogImage = extractMeta(html, 'og:image')
  const ogSiteName = extractMeta(html, 'og:site_name')

  return {
    title: ogTitle,
    description: ogDescription,
    image: ogImage,
    siteName: ogSiteName,
  }
}
