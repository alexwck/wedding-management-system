// =============================================================================
// Sentry Client Configuration
// =============================================================================
// Captures unhandled errors in the browser (client-side React components)
//
// Environments: Production only (disabled in development)
// Docs: https://docs.sentry.io/platforms/javascript/guides/nextjs/
// =============================================================================

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  // DSN: Data Source Name - authenticates with Sentry
  // Provided via environment variable in production
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Only enable in production
  enabled: process.env.NODE_ENV === "production",

  // Environment: identifies where error occurred
  environment: process.env.VERCEL_ENV || "production",

  // ---------------------------------------------------------------------------
  // Error Sampling
  // ---------------------------------------------------------------------------
  // 100% of errors captured (no sampling for production monitoring)
  tracesSampleRate: 0.1, // 10% of transactions for performance monitoring

  // ---------------------------------------------------------------------------
  // Session Replay (optional - records user sessions for debugging)
  // ---------------------------------------------------------------------------
  replaysSessionSampleRate: 0.1, // 10% of sessions
  replaysOnErrorSampleRate: 1.0, // 100% of error sessions

  // ---------------------------------------------------------------------------
  // Integrations
  // ---------------------------------------------------------------------------
  integrations: [
    // Session replay captures DOM mutations, clicks, console logs
    Sentry.replayIntegration({
      maskAllText: false, // Show user input in replays (helpful for debugging)
      blockAllMedia: true, // Block media for privacy/performance
    }),

    // Capture HTTP client errors (fetch, XMLHttpRequest)
    Sentry.httpClientIntegration({
      failedRequestStatusCodes: [500, 502, 503, 504], // Only server errors
    }),
  ],

  // ---------------------------------------------------------------------------
  // Before Send Hook
  // ---------------------------------------------------------------------------
  // Filter or modify events before sending to Sentry
  beforeSend(event, hint) {
    // Don't send events in development
    if (process.env.NODE_ENV === "development") {
      console.warn("[Sentry] Event captured (not sent in dev):", event);
      return null;
    }

    // Add custom context (user ID, route, etc.) if available
    // This is populated by setUser() calls throughout the app
    return event;
  },

  // ---------------------------------------------------------------------------
  // Ignore specific errors that are not actionable
  // ---------------------------------------------------------------------------
  ignoreErrors: [
    // Browser extensions
    "top.GLOBALS",
    "canvas.contentDocument",
    "Non-secure navigation",

    // Network errors (often transient, not actionable)
    "NetworkError",
    "Network request failed",

    // Random plugins/extensions
    "atomicFindClose",
    "fb_xd_fragment",

    // Other plugins
    "CallSite",
    "[object Object]",
  ],

  // ---------------------------------------------------------------------------
  // Deny URLs (third-party scripts we can't control)
  // ---------------------------------------------------------------------------
  denyUrls: [
    // Google Chrome extensions
    /extensions\//i,
    /^chrome:\/\//i,

    // Facebook flakiness
    /graph\.facebook\.com/i,

    // Facebook blocked
    /connect\.facebook\.net\/en_US\/all\.js/i,

    // Woopra flakiness
    /eatdifferent\.com\.woopra-ns\.com/i,
    /static\.woopra\.com\/js\/woopra\.js/i,

    // Other plugins
    /127\.0\.0\.1:4001\/isrunning/i,
    /webappstoolbarba\.test/i,
  ],
});
