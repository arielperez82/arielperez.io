// src/scripts/analytics/click-tracker.ts
import { eventPropertyFactory } from './event-property-factory'

const socialPlatforms = [
  'linkedin.com',
  'twitter.com',
  'github.com',
  'x.com',
  'instagram.com',
  'facebook.com'
]
const mediaPlatforms = [
  'substack.com',
  'medium.com',
  'podcasts.apple.com',
  'music.amazon.com',
  'spotify.com',
  'youtube.com'
]

const inferLinkType = (url: string) => {
  const fullUrl = new URL(url)
  const linkType =
    fullUrl.protocol === 'mailto:'
      ? 'email'
      : socialPlatforms.some((p) => fullUrl.hostname.includes(p))
        ? 'social'
        : mediaPlatforms.some((p) => fullUrl.hostname.includes(p))
          ? 'media'
          : 'web'
  return linkType
}

export const createClickTracker = () => {
  const handleClick = (event: Event) => {
    const target = event.target as HTMLElement

    // Check for tracking data attributes on the clicked element (or one of its parents)
    const trackingDataset =
      (target.dataset.track === undefined &&
        (target.closest('[data-track]') as HTMLElement)?.dataset) ||
      target.dataset

    if (trackingDataset.track === undefined) return

    const eventType = trackingDataset.trackEvent || 'link_click'

    // Start with generic properties
    const properties: Record<string, unknown> = {
      element_id: target.id || null
    }

    // Handle link_click specifically
    if (eventType === 'link_click') {
      const link = target.closest('a')

      if (!link || !link.href) {
        console.warn('link_click event triggered but no valid link found')
        return
      }

      const linkType = trackingDataset.trackLinkType || inferLinkType(link.href)

      // Add event-specific properties
      const generator = eventPropertyFactory.createGenerator(linkType)
      if (generator) {
        Object.assign(properties, generator(link))
      }
    } else {
      // For non-link events, bail for now
      console.warn(`Event type '${eventType}' is not yet implemented`)
      return
    }

    // Add custom data attributes
    Object.keys(trackingDataset).forEach((key) => {
      if (key.startsWith('trackProp')) {
        const propName = key.replace('trackProp', '').toLowerCase()
        properties[propName] = trackingDataset[key]
      }
    })

    if (window.analytics) {
      window.analytics.track(eventType, properties)
    }
  }

  const initialize = () => {
    document.addEventListener('click', handleClick)
  }

  return { initialize, handleClick }
}

export const clickTracker = createClickTracker()
