// =============================================================================
// Sentry Server Configuration
// =============================================================================
// Captures unhandled errors in server-side code:
//   - Server Actions (src/app/actions/*.ts)
//   - API Routes (if any)
//   - Next.js server-side rendering
//
// Environments: Production only (disabled in development)
// Docs: https://docs.sentry.io/platforms/javascript/guides/nextjs/
// =============================================================================

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  // DSN: Same as client config
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Only enable in production
  enabled: process.env.NODE_ENV === "production",

  // Environment: Vercel sets this automatically
  environment: process.env.VERCEL_ENV || "production",

  // ---------------------------------------------------------------------------
  // Performance Monitoring
  // ---------------------------------------------------------------------------
  // Sample rate for transactions (traces)
  // 10% is sufficient for production monitoring without overwhelming Sentry
  tracesSampleRate: 0.1,

  // ---------------------------------------------------------------------------
  // Profiling (optional - captures CPU profiles for performance debugging)
  // ---------------------------------------------------------------------------
  // profilesSampleRate: 0.1, // 10% of transactions with profile

  // ---------------------------------------------------------------------------
  // Before Send Hook
  // ---------------------------------------------------------------------------
  beforeSend(event, hint) {
    // Don't send events in development
    if (process.env.NODE_ENV === "development") {
      console.warn("[Sentry Server] Event captured (not sent in dev):", event);
      return null;
    }

    // Add server-specific context
    if (event.level === "error") {
      event.tags = {
        ...event.tags,
        runtime: "nodejs",
        platform: "vercel",
      };
    }

    return event;
  },

  // ---------------------------------------------------------------------------
  // Before Send Transaction Hook
  // ---------------------------------------------------------------------------
  beforeSendTransaction(event) {
    // Don't send transactions in development
    if (process.env.NODE_ENV === "development") {
      return null;
    }

    // Add transaction metadata
    event.tags = {
      ...event.tags,
      type: "transaction",
    };

    return event;
  },

  // ---------------------------------------------------------------------------
  // Integrations
  // ---------------------------------------------------------------------------
  integrations: [
    // Prisma integration (if using Prisma ORM)
    // Sentry.prismaIntegration(),

    // Database integration for raw SQL
    Sentry.postIntegration(),

    // Express integration (if using custom server)
    // Sentry.expressIntegration(),
  ],
});
