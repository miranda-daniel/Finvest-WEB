import posthog from 'posthog-js';
import { env } from '@/config/environment';

export const initPostHog = () => {
  if (!env.posthogKey) return;
  posthog.init(env.posthogKey, {
    api_host: env.posthogProxyUrl,
    autocapture: false,
  });
};

export { posthog };
