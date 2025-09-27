// Client-side analytics initialization
import { initTinybirdAnalytics } from 'tinybird-analytics'

// Initialize analytics with Tinybird plugin
const analytics = initTinybirdAnalytics({
  token: import.meta.env.PUBLIC_TINYBIRD_TRACKER_TOKEN,
  host: import.meta.env.PUBLIC_TINYBIRD_HOST,
  datasource: 'analytics_events',
  storage: 'localStorage',
  domain: 'arielperez.io',
  tenantId: 'ariel-perez-io',
  webVitals: true,
  globalAttributes: {
    site: 'ariel-perez-io'
  },
  devMode: import.meta.env.DEV,
  enableClickTracking: true
})

export default analytics
