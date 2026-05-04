import { createFileRoute, redirect } from '@tanstack/react-router';
import { PortfolioDetailPage } from '@/components/PortfolioDetailPage/PortfolioDetailPage';

export const Route = createFileRoute('/_authenticated/portfolios/$portfolioId')({
  beforeLoad: ({ params }) => {
    const id = Number(params.portfolioId);
    if (!Number.isInteger(id) || id <= 0) throw redirect({ to: '/dashboard' });
  },
  component: PortfolioDetailPageRoute,
});

function PortfolioDetailPageRoute() {
  const { portfolioId } = Route.useParams();
  return <PortfolioDetailPage portfolioId={Number(portfolioId)} />;
}
