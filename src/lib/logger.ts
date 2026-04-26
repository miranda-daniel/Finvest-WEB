const isDev = import.meta.env.DEV;

// Single integration point for external monitoring tools (Sentry, PostHog, Datadog, etc.)
// To add Sentry: call Sentry.captureException(error) inside the error() method below.
//
// Usage intent:
//   error() — unexpected failures the user should never see (API errors, broken state)
//   warn()  — unexpected but recoverable situations worth knowing about in production
//   info()  — significant lifecycle events (dev only)
//   debug() — detailed tracing for development (dev only)
const logger = {
  info: (message: string, ...args: unknown[]) => {
    if (isDev) console.info(`[INFO] ${message}`, ...args);
  },

  warn: (message: string, ...args: unknown[]) => {
    console.warn(`[WARN] ${message}`, ...args);
  },

  error: (message: string, error?: unknown, ...args: unknown[]) => {
    console.error(`[ERROR] ${message}`, error, ...args);
  },

  debug: (message: string, ...args: unknown[]) => {
    if (isDev) console.debug(`[DEBUG] ${message}`, ...args);
  },
};

export default logger;
