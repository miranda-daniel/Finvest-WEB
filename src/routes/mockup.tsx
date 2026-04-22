import { createFileRoute } from '@tanstack/react-router';
import MockupPortfolio from '@/components/MockupPortfolio';

export const Route = createFileRoute('/mockup')({
  component: MockupPortfolio,
});
