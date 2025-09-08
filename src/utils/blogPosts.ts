// src/utils/blogPosts.ts
export interface BlogPost {
  title: string
  description: string
  publishingDate: string
  readingTime: string
  heroImageUrl: string
  url: string
}

export async function fetchLatestBlogPosts(): Promise<BlogPost[]> {
  const API_URL = 'https://www.adaptivealchemist.com/blog.json'

  try {
    const response = await fetch(API_URL, {
      // Add cache control for build-time fetching
      headers: {
        'Cache-Control': 'no-cache'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const posts = await response.json()

    if (!Array.isArray(posts)) {
      throw new Error('Invalid response format: expected array')
    }

    // Sort by publishing date and take the latest 3
    const sortedPosts = posts
      .sort(
        (a, b) =>
          new Date(b.publishingDate).getTime() -
          new Date(a.publishingDate).getTime()
      )
      .slice(0, 3)

    return sortedPosts
  } catch (error) {
    console.error('Failed to fetch blog posts from API:', error)
    throw new Error('Unable to fetch blog posts')
  }
}
