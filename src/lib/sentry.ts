import * as Sentry from '@sentry/react';
import { env } from '@/config/environment';

export const initSentry = () => {
  if (!env.sentryDsn) return;
  Sentry.init({
    dsn: env.sentryDsn,
    tunnel: '/sentry',
    environment: env.sentryEnv,
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: env.sentryEnv === 'production' ? 0.1 : 1.0,
  });
};

export { Sentry };
