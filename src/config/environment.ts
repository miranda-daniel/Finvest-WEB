export const env = {
  posthogKey:      import.meta.env.VITE_POSTHOG_KEY       ?? '',
  posthogProxyUrl: import.meta.env.VITE_POSTHOG_PROXY_URL ?? '/posthog',
  sentryDsn:       import.meta.env.VITE_SENTRY_DSN        ?? '',
  sentryEnv:       import.meta.env.VITE_ENV               ?? 'development',
};
