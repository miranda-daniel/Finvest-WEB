import { createFileRoute } from '@tanstack/react-router';
import { PortfolioDetailPage } from '@/components/PortfolioDetailPage/PortfolioDetailPage';

export const Route = createFileRoute('/_authenticated/portfolios/$portfolioId')({
  component: PortfolioDetailPageRoute,
});

function PortfolioDetailPageRoute() {
  const { portfolioId } = Route.useParams();
  return <PortfolioDetailPage portfolioId={Number(portfolioId)} />;
}
