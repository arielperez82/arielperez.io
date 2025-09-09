// Client-side analytics initialization
import Analytics from 'analytics'
import doNotTrack from 'analytics-plugin-do-not-track'

import tinybirdPlugin from './tinybird-analytics-plugin'

// Initialize analytics with Tinybird plugin
const analytics = Analytics({
  app: 'ariel-perez-io',
  plugins: [
    doNotTrack(),
    tinybirdPlugin({
      token: import.meta.env.PUBLIC_TINYBIRD_TRACKER_TOKEN,
      host: import.meta.env.PUBLIC_TINYBIRD_HOST,
      datasource: 'analytics_events',
      storage: 'localStorage',
      domain: 'arielperez.io',
      tenantId: 'ariel-perez-io',
      webVitals: true,
      globalAttributes: {
        site: 'ariel-perez-io'
      }
    })
  ]
})

// Make analytics available globally
window.analytics = analytics

export default analytics

// Export tracking modules
export { clickTracker } from './click-tracker'
export { eventPropertyFactory } from './event-property-factory'
