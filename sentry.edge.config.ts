// =============================================================================
// Sentry Edge Configuration
// =============================================================================
// Captures unhandled errors in Edge Functions
//
// Note: This app uses Vercel Fluid Compute (default) which runs Node.js,
// not Edge runtime. This config is included for completeness if any
// routes are migrated to Edge runtime in the future.
//
// Environments: Production only (disabled in development)
// Docs: https://docs.sentry.io/platforms/javascript/guides/nextjs/
// =============================================================================

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  // DSN: Same as client/server config
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Only enable in production
  enabled: process.env.NODE_ENV === "production",

  // Environment: Vercel sets this automatically
  environment: process.env.VERCEL_ENV || "production",

  // ---------------------------------------------------------------------------
  // Performance Monitoring
  // ---------------------------------------------------------------------------
  // Lower sample rate for edge functions (typically high volume, low latency)
  tracesSampleRate: 0.05, // 5% of transactions

  // ---------------------------------------------------------------------------
  // Before Send Hook
  // ---------------------------------------------------------------------------
  beforeSend(event, hint) {
    // Don't send events in development
    if (process.env.NODE_ENV === "development") {
      console.warn("[Sentry Edge] Event captured (not sent in dev):", event);
      return null;
    }

    // Add edge-specific context
    if (event.level === "error") {
      event.tags = {
        ...event.tags,
        runtime: "edge",
        platform: "vercel",
      };
    }

    return event;
  },
});
