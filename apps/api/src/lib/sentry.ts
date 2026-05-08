/**
 * Sentry for the API (Express).
 * Free tier: 5,000 error events/month.
 * Import this at the top of src/index.ts BEFORE other imports.
 */

// When @sentry/node is installed, enable by setting SENTRY_DSN in env.
// To install: npm install @sentry/node in apps/api
// The conditional import keeps the API working without Sentry configured.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let Sentry: any = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment
  Sentry = require("@sentry/node");
} catch {
  // Sentry not installed — skip
}

export function initSentry(): void {
  if (!process.env.SENTRY_DSN || !Sentry) return;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV ?? "development",
    tracesSampleRate: 0.1,
  });
}

export function captureException(err: unknown): void {
  if (Sentry && process.env.SENTRY_DSN) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    Sentry.captureException(err);
  } else {
    console.error("[unhandled]", err);
  }
}
