import * as Sentry from '@sentry/react';
import { env } from '@/config/environment';

export const initSentry = () => {
  if (!env.sentryDsn) return;
  Sentry.init({
    dsn: env.sentryDsn,
    environment: env.sentryEnv,
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: 1.0,
  });
};

export { Sentry };
