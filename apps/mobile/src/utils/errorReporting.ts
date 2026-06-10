/**
 * Mobile error / performance reporting.
 * Free tier: 5,000 events/month on Sentry.
 *
 * To enable:
 *   npm install @sentry/react-native in apps/mobile
 *   Add SENTRY_DSN to your .env / react-native-config
 *
 * This shim keeps the app working without Sentry configured.
 */
export function captureException(err: unknown, context?: Record<string, unknown>): void {
  try {
    const Sentry = require("@sentry/react-native");
    if (context) {
      Sentry.withScope((scope: { setExtras: (c: unknown) => void }) => {
        scope.setExtras(context);
        Sentry.captureException(err);
      });
    } else {
      Sentry.captureException(err);
    }
  } catch {
    console.error("[error]", err);
  }
}

export function captureMessage(message: string): void {
  try {
    require("@sentry/react-native").captureMessage(message);
  } catch {
    console.info("[info]", message);
  }
}
