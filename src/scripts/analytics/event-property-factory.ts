// src/scripts/analytics/event-property-factory.ts
export interface LinkClickProperties {
  link_url: string
  link_text: string
  link_host: string
  link_path: string
  link_params: string
  link_hash: string
  is_external: boolean
}

export interface EmailClickProperties extends LinkClickProperties {
  email_address: string
  email_subject: string | null
  email_body: string | null
}

export interface SocialClickProperties extends LinkClickProperties {
  platform: string
}

export type TrackingProperties =
  | LinkClickProperties
  | EmailClickProperties
  | SocialClickProperties
  | Record<string, unknown>

type PropertyGenerator = (
  link: HTMLAnchorElement
) =>
  | LinkClickProperties
  | EmailClickProperties
  | SocialClickProperties
  | Record<string, unknown>

const getPlatformFromHostname = (hostname: string) => {
  if (hostname.includes('podcasts.apple')) return 'apple-podcasts'
  if (hostname.includes('spotify')) return 'spotify'
  if (hostname.includes('substack')) return 'substack'
  if (hostname.includes('music.amazon')) return 'amazon-music'
  return hostname.replace(/www\./, '').replace(/\.com$/, '')
}

const linkClickPropertyGenerator = (
  link: HTMLAnchorElement
): LinkClickProperties => {
  const url = new URL(link.href, window.location.origin)
  const mappedSearchParams = new URLSearchParams()
  url.searchParams.forEach((value, key) => {
    mappedSearchParams.set(key, decodeURIComponent(value))
  })

  return {
    link_url: link.href,
    link_text: link.textContent?.trim() || '',
    link_host: url.hostname,
    link_path: url.pathname,
    link_params: mappedSearchParams.toString(),
    link_hash: url.hash.substring(1),
    is_external: url.hostname !== window.location.hostname
  }
}

class EventPropertyFactory {
  private generators = new Map<string, PropertyGenerator>([
    ['web', linkClickPropertyGenerator],
    [
      'email',
      (link: HTMLAnchorElement): EmailClickProperties => {
        const url = new URL(link.href)
        return {
          ...linkClickPropertyGenerator(link),
          email_address: url.pathname,
          email_subject: url.searchParams.get('subject') || null,
          email_body: url.searchParams.get('body') || null
        }
      }
    ],

    [
      'social',
      (link: HTMLAnchorElement): SocialClickProperties => {
        const url = new URL(link.href, window.location.origin)
        return {
          ...linkClickPropertyGenerator(link),
          platform: getPlatformFromHostname(url.hostname)
        }
      }
    ],

    [
      'media',
      (link: HTMLAnchorElement): SocialClickProperties => {
        const url = new URL(link.href, window.location.origin)

        return {
          ...linkClickPropertyGenerator(link),
          platform: getPlatformFromHostname(url.hostname)
        }
      }
    ]
  ])

  createGenerator(eventType: string): PropertyGenerator {
    return this.generators.get(eventType) || linkClickPropertyGenerator
  }

  register(eventType: string, generator: PropertyGenerator): void {
    this.generators.set(eventType, generator)
  }
}

export const eventPropertyFactory = new EventPropertyFactory()
