import { createFileRoute } from '@tanstack/react-router';
import MockupPortfolio from '@/components/MockupPortfolio';

// /mockup is intentionally public (no auth guard) — it is a design reference
// that exists only for development. It will be removed before going to production.
export const Route = createFileRoute('/mockup')({
  component: MockupPortfolio,
});
